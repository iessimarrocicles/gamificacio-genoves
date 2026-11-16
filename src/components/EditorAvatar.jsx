import { OPCIONS_AVATAR, COMPLEMENTS } from '../domini/barem.js';

const NOM_CABELL = { curt: 'Curt', llarg: 'Llarg', cua: 'Cua', arrissat: 'Arrissat', trenes: 'Trenes' };

function Grup({ titol, children }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-lg font-semibold">{titol}</legend>
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </fieldset>
  );
}

function Color({ color, triat, onTria, nom }) {
  return (
    <button
      type="button"
      onClick={onTria}
      aria-pressed={triat}
      aria-label={nom}
      className={`size-14 rounded-full border-[3px] ${triat ? 'border-llosa-900 ring-4 ring-groc-400' : 'border-llosa-300'}`}
      style={{ background: color }}
    />
  );
}

/** Opcions per a personalitzar el pilotari: equip, pell, cabell i complements guanyats. */
export default function EditorAvatar({ avatar, record, onCanvia }) {
  const posa = (canvis) => onCanvia({ ...avatar, ...canvis });
  const commuta = (id) => {
    const te = avatar.complements.includes(id);
    posa({ complements: te ? avatar.complements.filter((c) => c !== id) : [...avatar.complements, id] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Els meus complements</h3>
        <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
          {COMPLEMENTS.map((c) => {
            const desbloquejat = record >= c.minim;
            const posat = avatar.complements.includes(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={!desbloquejat}
                  onClick={() => commuta(c.id)}
                  aria-pressed={desbloquejat ? posat : undefined}
                  className={`flex min-h-20 w-full flex-col justify-center rounded-2xl border-[3px] px-3 py-2 text-left ${
                    !desbloquejat
                      ? 'border-dashed border-llosa-300 bg-llosa-100 text-llosa-500'
                      : posat
                        ? 'border-groc-400 bg-groc-100'
                        : 'border-llosa-200 bg-white hover:bg-llosa-100'
                  }`}
                >
                  <span className="text-lg font-semibold leading-tight">{c.nom}</span>
                  <span className="text-base leading-tight">
                    {!desbloquejat ? `🔒 Als ${c.minim} quinzes` : posat ? 'Posat' : 'Toca per a posar-te’l'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <Grup titol="El meu equip">
        {OPCIONS_AVATAR.samarreta.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => posa({ samarreta: s })}
            aria-pressed={avatar.samarreta === s}
            className={`min-h-14 rounded-2xl border-[3px] px-6 text-lg font-semibold text-white ${
              s === 'blava' ? 'bg-blau-600' : 'bg-roig-600'
            } ${avatar.samarreta === s ? 'border-llosa-900 ring-4 ring-groc-400' : 'border-transparent'}`}
          >
            {s === 'blava' ? 'Blaus' : 'Rojos'}
          </button>
        ))}
      </Grup>

      <Grup titol="Color de pell">
        {OPCIONS_AVATAR.pell.map((color, i) => (
          <Color key={color} color={color} nom={`To de pell ${i + 1}`} triat={avatar.pell === color} onTria={() => posa({ pell: color })} />
        ))}
      </Grup>

      <Grup titol="Pentinat">
        {OPCIONS_AVATAR.cabellEstil.map((estil) => (
          <button
            key={estil}
            type="button"
            onClick={() => posa({ cabellEstil: estil })}
            aria-pressed={avatar.cabellEstil === estil}
            className={`min-h-14 rounded-2xl border-[3px] px-5 text-lg font-semibold ${
              avatar.cabellEstil === estil ? 'border-llosa-900 bg-groc-100 ring-4 ring-groc-400' : 'border-llosa-200 bg-white'
            }`}
          >
            {NOM_CABELL[estil]}
          </button>
        ))}
      </Grup>

      <Grup titol="Color del cabell">
        {OPCIONS_AVATAR.cabellColor.map((color, i) => (
          <Color key={color} color={color} nom={`Color de cabell ${i + 1}`} triat={avatar.cabellColor === color} onTria={() => posa({ cabellColor: color })} />
        ))}
      </Grup>
    </div>
  );
}
