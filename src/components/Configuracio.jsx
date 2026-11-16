import { useRef, useState } from 'react';
import Finestra from './Finestra.jsx';
import AvatarPilotari from './AvatarPilotari.jsx';
import { useClasse } from '../estat/ClasseContext.jsx';
import { crearAlumne, nouId } from '../domini/reductor.js';
import { PREMIS_SUGGERITS, CATEGORIES_TRINQUET } from '../domini/barem.js';
import { suggerimentsDisponibles } from '../domini/suggeriments.js';
import { LIMITS_PARTIDA, estatPartida } from '../domini/partida.js';
import { aCopia, deCopia, baixaFitxer, dataPerAFitxer } from '../dades/copia.js';
import { hiHaVeu } from '../so/so.js';

const PESTANYES = [
  { id: 'alumnes', nom: 'Alumnes' },
  { id: 'categories', nom: 'Categories' },
  { id: 'partida', nom: 'Partida' },
  { id: 'aula', nom: 'Aula i so' },
  { id: 'dades', nom: 'Dades' },
];

// Icones de les propostes del trinquet i unes quantes més de classe.
const ICONES = [
  ...new Set([...CATEGORIES_TRINQUET.map((c) => c.icona), '✏️', '🎨', '🔢', '🗣️', '🌱', '⭐', '🏃']),
];

const camp = 'min-h-12 w-full rounded-xl border-[3px] border-llosa-200 bg-white px-3 text-lg focus:border-blau-500 focus:outline-none';
const botoPrimari = 'min-h-12 rounded-xl bg-blau-600 px-5 text-lg font-semibold text-white hover:bg-blau-700 disabled:opacity-40';
const botoSecundari = 'min-h-12 rounded-xl border-[3px] border-llosa-300 bg-white px-4 text-lg font-semibold text-llosa-700 hover:bg-llosa-100';

/** Botó que demana confirmació amb un segon toc (sense finestres del navegador). */
function BotoConfirma({ children, pregunta, onConfirma, className = botoSecundari }) {
  const [segur, setSegur] = useState(false);
  if (!segur) {
    return (
      <button type="button" className={className} onClick={() => setSegur(true)}>
        {children}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2 rounded-xl bg-ambre-100 px-3 py-1.5">
      <span className="text-base font-semibold text-ambre-700">{pregunta}</span>
      <button
        type="button"
        className="min-h-11 rounded-lg bg-llosa-900 px-4 text-base font-semibold text-white"
        onClick={() => {
          setSegur(false);
          onConfirma();
        }}
      >
        Sí
      </button>
      <button type="button" className="min-h-11 rounded-lg bg-white px-4 text-base font-semibold" onClick={() => setSegur(false)}>
        No
      </button>
    </span>
  );
}

function Alumnes() {
  const { estat, dispatch } = useClasse();
  const [nom, setNom] = useState('');
  const [llista, setLlista] = useState('');

  const afig = (e) => {
    e.preventDefault();
    if (!nom.trim()) return;
    dispatch({ type: 'ALUMNE_AFEGIR', alumne: crearAlumne(nom, estat.alumnes.length) });
    setNom('');
  };

  const noms = llista.split(/\r?\n|,|;/).map((n) => n.trim()).filter(Boolean);
  const afigLlista = () => {
    dispatch({ type: 'ALUMNES_AFEGIR', alumnes: noms.map((n, i) => crearAlumne(n, estat.alumnes.length + i)) });
    setLlista('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={afig} className="flex flex-wrap items-end gap-3">
        <label className="min-w-56 flex-1">
          <span className="mb-1 block text-lg font-semibold">Afig un/a alumne/a</span>
          <input className={camp} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom" maxLength={24} />
        </label>
        <button type="submit" className={botoPrimari} disabled={!nom.trim()}>
          Afig
        </button>
      </form>

      <div>
        <label>
          <span className="mb-1 block text-lg font-semibold">O apega tota la llista</span>
          <textarea
            className={`${camp} min-h-28 py-2`}
            value={llista}
            onChange={(e) => setLlista(e.target.value)}
            placeholder={'Un nom per línia:\nAitana\nBlai\nCarme'}
          />
        </label>
        <button type="button" className={`${botoPrimari} mt-2`} disabled={noms.length === 0} onClick={afigLlista}>
          {noms.length > 0 ? `Afig ${noms.length} ${noms.length === 1 ? 'alumne/a' : 'alumnes'}` : 'Afig la llista'}
        </button>
        <p className="mt-2 text-base text-llosa-500">Usa només el nom de pila: les dades es queden en este aparell.</p>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-semibold">
          {estat.alumnes.length === 0 ? 'Encara no hi ha alumnes' : `Alumnes de la classe (${estat.alumnes.length})`}
        </h3>
        <ul className="space-y-2">
          {estat.alumnes.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border-[3px] border-llosa-200 bg-white p-2">
              <AvatarPilotari avatar={a.avatar} mida={40} />
              <input
                className={`${camp.replace('w-full ', '')} min-w-40 flex-1`}
                defaultValue={a.nom}
                aria-label={`Nom de ${a.nom}`}
                maxLength={24}
                onBlur={(e) => {
                  if (e.target.value.trim() && e.target.value.trim() !== a.nom) {
                    dispatch({ type: 'ALUMNE_EDITAR', id: a.id, canvis: { nom: e.target.value } });
                  } else {
                    e.target.value = a.nom;
                  }
                }}
              />
              <span className="xifres w-24 text-center text-lg text-llosa-700">{a.quinzes} q.</span>
              <BotoConfirma pregunta={`Esborrar ${a.nom}?`} onConfirma={() => dispatch({ type: 'ALUMNE_ELIMINAR', id: a.id })}>
                Esborra
              </BotoConfirma>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FilaCategoria({ categoria }) {
  const { dispatch } = useClasse();
  const edita = (canvis) => dispatch({ type: 'CATEGORIA_EDITAR', id: categoria.id, canvis });
  const esMillora = categoria.tipus === 'millora';

  return (
    <li className={`rounded-2xl border-[3px] p-3 ${esMillora ? 'border-llosa-200 bg-white' : 'border-groc-200 bg-groc-100/50'}`}>
      <div className="flex flex-wrap items-center gap-3">
        <select
          className={`${camp.replace('w-full ', '')} w-24 shrink-0 text-2xl`}
          value={categoria.icona}
          onChange={(e) => edita({ icona: e.target.value })}
          aria-label={`Icona de ${categoria.nom}`}
        >
          {[...new Set([categoria.icona, ...ICONES])].map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        <input
          className={`${camp.replace('w-full ', '')} min-w-44 flex-1 font-semibold`}
          defaultValue={categoria.nom}
          aria-label="Nom de la categoria"
          maxLength={30}
          onBlur={(e) => edita({ nom: e.target.value })}
        />
        <div className="flex items-center gap-1.5" role="group" aria-label={`Quinzes de ${categoria.nom}`}>
          <button type="button" className={`${botoSecundari} w-12 px-0`} onClick={() => edita({ valor: categoria.valor - 1 })} disabled={categoria.valor <= 1} aria-label="Menys quinzes">
            −
          </button>
          <span className={`xifres w-14 text-center font-display text-2xl ${esMillora ? 'text-llosa-700' : ''}`}>
            {esMillora ? '−' : '+'}
            {categoria.valor}
          </span>
          <button type="button" className={`${botoSecundari} w-12 px-0`} onClick={() => edita({ valor: categoria.valor + 1 })} disabled={categoria.valor >= 5} aria-label="Més quinzes">
            +
          </button>
        </div>
        <BotoConfirma pregunta="Esborrar-la?" onConfirma={() => dispatch({ type: 'CATEGORIA_ELIMINAR', id: categoria.id })}>
          Esborra
        </BotoConfirma>
      </div>
      <input
        className={`${camp} mt-2 text-base`}
        defaultValue={categoria.descripcio}
        aria-label="Descripció"
        placeholder="Descripció curta (què vol dir per a l’alumnat)"
        maxLength={80}
        onBlur={(e) => edita({ descripcio: e.target.value })}
      />
    </li>
  );
}

const EN_BLANC = '__en-blanc__';

/** Desplegable amb propostes del trinquet per a afegir una categoria (o una en blanc). */
function AfigCategoria({ tipus, etiqueta }) {
  const { estat, dispatch } = useClasse();
  const [triada, setTriada] = useState('');
  const propostes = suggerimentsDisponibles(estat.categories, tipus);
  const signe = tipus === 'millora' ? '−' : '+';

  const afig = () => {
    const proposta = propostes.find((c) => c.id === triada);
    const categoria = proposta
      ? { ...proposta }
      : {
          id: nouId('cat'),
          nom: tipus === 'positiu' ? 'Categoria nova' : 'Aspecte a millorar',
          icona: tipus === 'positiu' ? '⭐' : '💭',
          valor: 1,
          tipus,
          descripcio: '',
        };
    dispatch({ type: 'CATEGORIA_AFEGIR', categoria });
    setTriada('');
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <select
        className={`${camp.replace('w-full ', '')} min-w-64 flex-1`}
        value={triada}
        onChange={(e) => setTriada(e.target.value)}
        aria-label={etiqueta}
      >
        <option value="">{etiqueta}…</option>
        {propostes.length > 0 && (
          <optgroup label="Propostes del trinquet">
            {propostes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icona} {c.nom} ({signe}
                {c.valor}): {c.descripcio}
              </option>
            ))}
          </optgroup>
        )}
        <option value={EN_BLANC}>✏️ Una de nova, en blanc</option>
      </select>
      <button type="button" className={botoPrimari} disabled={!triada} onClick={afig}>
        Afig
      </button>
    </div>
  );
}

function Categories() {
  const { estat } = useClasse();
  const actives = estat.categories.filter((c) => !c.arxivada);

  return (
    <div className="space-y-6">
      {[
        { tipus: 'positiu', titol: 'Sumen quinzes', etiqueta: 'Afig una categoria que suma' },
        { tipus: 'millora', titol: 'Per a millorar (avís o restar quinzes)', etiqueta: 'Afig un aspecte a millorar' },
      ].map((grup) => (
        <div key={grup.tipus}>
          <h3 className="mb-2 text-lg font-semibold">{grup.titol}</h3>
          <ul className="space-y-2">
            {actives.filter((c) => c.tipus === grup.tipus).map((c) => (
              <FilaCategoria key={c.id} categoria={c} />
            ))}
          </ul>
          <AfigCategoria tipus={grup.tipus} etiqueta={grup.etiqueta} />
        </div>
      ))}
    </div>
  );
}

/** Camp numèric: deixa escriure lliurement i valida en eixir del camp. */
function CampNumero({ valor, limits, onCanvia }) {
  const [text, setText] = useState(String(valor));
  const [vist, setVist] = useState(valor);
  if (vist !== valor) {
    setVist(valor);
    setText(String(valor));
  }
  return (
    <>
      <input
        type="number"
        inputMode="numeric"
        className={camp}
        min={limits.min}
        max={limits.max}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          onCanvia(text);
          setText(String(valor));
          setVist(null);
        }}
      />
      <span className="mt-1 block text-base text-llosa-500">Entre {limits.min} i {limits.max}.</span>
    </>
  );
}

function Partida() {
  const { estat, dispatch } = useClasse();
  const p = estat.partida;
  const e = estatPartida(p);
  const config = (canvis) => dispatch({ type: 'PARTIDA_CONFIG', canvis });

  return (
    <div className="space-y-6">
      <p className="rounded-2xl bg-blau-50 px-4 py-3 text-lg">
        Cada quinze que guanya un/a alumne/a suma també a la partida de la classe. Ara porteu{' '}
        <strong className="xifres">{e.acumulat}</strong> de <strong className="xifres">{e.objectiu}</strong> quinzes.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-lg font-semibold">Quinzes de classe per a fer un joc</span>
          <CampNumero limits={LIMITS_PARTIDA.quinzesPerJoc} valor={p.quinzesPerJoc} onCanvia={(v) => config({ quinzesPerJoc: v })} />
        </label>
        <label>
          <span className="mb-1 block text-lg font-semibold">Jocs per a guanyar la partida</span>
          <CampNumero limits={LIMITS_PARTIDA.jocsObjectiu} valor={p.jocsObjectiu} onCanvia={(v) => config({ jocsObjectiu: v })} />
        </label>
      </div>

      <div>
        <label>
          <span className="mb-1 block text-lg font-semibold">Premi de la partida</span>
          <input className={camp} value={p.premi} maxLength={60} onChange={(ev) => config({ premi: ev.target.value })} />
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {PREMIS_SUGGERITS.map((premi) => (
            <button key={premi} type="button" className="min-h-11 rounded-full bg-groc-100 px-4 text-base font-semibold hover:bg-groc-200" onClick={() => config({ premi })}>
              {premi}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <BotoConfirma pregunta="Posar el marcador a zero?" onConfirma={() => dispatch({ type: 'PARTIDA_NOVA' })}>
          Comença una partida nova
        </BotoConfirma>
        <span className="text-lg text-llosa-700">Partides guanyades este curs: <strong className="xifres">{p.guanyades}</strong></span>
      </div>
    </div>
  );
}

function Interruptor({ actiu, onCanvia, titol, ajuda, desactivat = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actiu}
      disabled={desactivat}
      onClick={() => onCanvia(!actiu)}
      className="flex min-h-16 w-full items-center gap-4 rounded-2xl border-[3px] border-llosa-200 bg-white px-4 py-2 text-left disabled:opacity-50"
    >
      <span className={`relative h-9 w-16 shrink-0 rounded-full transition-colors ${actiu ? 'bg-blau-600' : 'bg-llosa-300'}`}>
        <span className={`absolute top-1 size-7 rounded-full bg-white transition-[left] ${actiu ? 'left-8' : 'left-1'}`} />
      </span>
      <span>
        <span className="block text-lg font-semibold">{titol}</span>
        <span className="block text-base text-llosa-500">{ajuda}</span>
      </span>
    </button>
  );
}

function Aula() {
  const { estat, dispatch, so } = useClasse();
  const veu = hiHaVeu();
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-lg font-semibold">Nom de l’aula</span>
          <input className={camp} value={estat.aula.nom} maxLength={30} onChange={(e) => dispatch({ type: 'AULA_EDITAR', canvis: { nom: e.target.value } })} />
        </label>
        <label>
          <span className="mb-1 block text-lg font-semibold">Escola</span>
          <input className={camp} value={estat.aula.escola} maxLength={40} onChange={(e) => dispatch({ type: 'AULA_EDITAR', canvis: { escola: e.target.value } })} />
        </label>
      </div>
      <Interruptor
        actiu={estat.config.so}
        titol="Sons"
        ajuda="El colp de la pilota en donar quinzes i les músiques de celebració."
        onCanvia={(valor) => {
          dispatch({ type: 'CONFIG', canvis: { so: valor } });
          if (valor) setTimeout(() => so('quinze'), 50);
        }}
      />
      <Interruptor
        actiu={estat.config.veu && veu}
        desactivat={!veu || !estat.config.so}
        titol="Veu en valencià"
        ajuda={
          veu
            ? 'Diu en veu alta frases com «Quinze!» o «Bona pilota!».'
            : 'Este aparell no té cap veu en valencià/català instal·lada.'
        }
        onCanvia={(valor) => dispatch({ type: 'CONFIG', canvis: { veu: valor } })}
      />
    </div>
  );
}

function Dades() {
  const { estat, dispatch } = useClasse();
  const fitxer = useRef(null);
  const [missatge, setMissatge] = useState(null);

  const exporta = () => {
    baixaFitxer(`trinquet-de-3r-${dataPerAFitxer()}.json`, aCopia(estat), 'application/json');
    setMissatge({ to: 'be', text: 'Còpia baixada. Guarda-la en un lloc segur.' });
  };

  const importa = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const { estat: recuperat, error } = deCopia(await f.text());
    if (error) {
      setMissatge({ to: 'error', text: error });
      return;
    }
    dispatch({ type: 'CARREGAR', estat: recuperat });
    setMissatge({ to: 'be', text: `Còpia recuperada: ${recuperat.alumnes.length} alumnes.` });
  };

  return (
    <div className="space-y-6">
      <p className="rounded-2xl bg-blau-50 px-4 py-3 text-lg">
        Totes les dades es guarden <strong>només en este aparell i en este navegador</strong>. Si esborres les dades del
        navegador o canvies d’aparell, es perden. Baixa una còpia de tant en tant.
      </p>

      <div>
        <h3 className="mb-2 text-lg font-semibold">Còpia de seguretat</h3>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={botoPrimari} onClick={exporta}>
            Baixa una còpia
          </button>
          <button type="button" className={botoSecundari} onClick={() => fitxer.current?.click()}>
            Recupera una còpia
          </button>
          <input ref={fitxer} type="file" accept="application/json,.json" className="hidden" onChange={importa} aria-label="Fitxer de còpia" />
        </div>
        {missatge && (
          <p role="status" className={`mt-3 rounded-xl px-4 py-2 text-lg font-semibold ${missatge.to === 'be' ? 'bg-groc-100' : 'bg-ambre-100 text-ambre-700'}`}>
            {missatge.text}
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-lg font-semibold">Començar de nou</h3>
        <div className="flex flex-col items-start gap-3">
          <BotoConfirma
            pregunta="Posar tots els quinzes a zero?"
            onConfirma={() => {
              dispatch({ type: 'QUINZES_REINICIAR' });
              setMissatge({ to: 'be', text: 'Quinzes a zero. Els alumnes i les categories es conserven.' });
            }}
          >
            Posa els quinzes a zero (trimestre nou)
          </BotoConfirma>
          <BotoConfirma
            pregunta="Esborrar alumnes, quinzes i configuració?"
            onConfirma={() => {
              dispatch({ type: 'TOT_REINICIAR' });
              setMissatge({ to: 'be', text: 'S’ha esborrat tot.' });
            }}
          >
            Esborra-ho tot
          </BotoConfirma>
        </div>
      </div>
    </div>
  );
}

export default function Configuracio({ onTanca, inicial = 'alumnes' }) {
  const [pestanya, setPestanya] = useState(inicial);
  const Contingut = { alumnes: Alumnes, categories: Categories, partida: Partida, aula: Aula, dades: Dades }[pestanya];

  return (
    <Finestra titol="Configuració" onTanca={onTanca} ample="max-w-4xl">
      <div role="tablist" aria-label="Apartats de configuració" className="mb-5 flex flex-wrap gap-2">
        {PESTANYES.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestanya === p.id}
            onClick={() => setPestanya(p.id)}
            className={`min-h-12 rounded-full px-5 text-lg font-semibold ${
              pestanya === p.id ? 'bg-llosa-900 text-white' : 'bg-white text-llosa-700 hover:bg-llosa-100'
            }`}
          >
            {p.nom}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        <Contingut />
      </div>
    </Finestra>
  );
}
