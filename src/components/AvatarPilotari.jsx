// El pilotari o la pilotari de cada alumne/a, dibuixat en SVG.
// Roba blanca de pilota amb samarreta de l'equip (blava o roja) i complements.

const EQUIP = {
  blava: { samarreta: '#1f4fa3', ombra: '#173f86', faixa: '#123267' },
  roja: { samarreta: '#d7263d', ombra: '#a81b2d', faixa: '#7d1421' },
};

function Cabell({ estil, color }) {
  const comu = { fill: color };
  switch (estil) {
    case 'llarg':
      return (
        <g {...comu}>
          <path d="M33 46 C28 2 92 2 87 46 L88 74 C82 78 78 70 78 58 L42 58 C42 70 38 78 32 74 Z" />
        </g>
      );
    case 'cua':
      return (
        <g {...comu}>
          <path d="M34 44 C30 3 90 3 86 44 C76 33 58 29 34 44 Z" />
          <path d="M83 30 C100 26 104 46 94 62 C92 50 88 44 82 40 Z" />
        </g>
      );
    case 'arrissat':
      return (
        <g {...comu}>
          {[
            [38, 34, 9], [48, 24, 10], [60, 20, 10], [72, 24, 10], [82, 34, 9], [35, 46, 7], [85, 46, 7],
          ].map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      );
    case 'trenes':
      return (
        <g {...comu}>
          <path d="M34 46 C30 3 90 3 86 46 C76 31 44 31 34 46 Z" />
          <path d="M32 46 q-6 8 0 14 q6 8 0 16 q-4 6 2 10 l6 -2 q-4 -6 0 -12 q6 -8 0 -16 q-3 -6 0 -10 Z" />
          <path d="M88 46 q6 8 0 14 q-6 8 0 16 q4 6 -2 10 l-6 -2 q4 -6 0 -12 q-6 -8 0 -16 q3 -6 0 -10 Z" />
        </g>
      );
    case 'curt':
    default:
      return (
        <g {...comu}>
          <path d="M34 44 C30 3 90 3 86 44 C81 30 68 27 60 31 C52 27 39 30 34 44 Z" />
        </g>
      );
  }
}

export default function AvatarPilotari({ avatar, mida = 96, className = '', titol }) {
  const equip = EQUIP[avatar?.samarreta] ?? EQUIP.blava;
  const pell = avatar?.pell ?? '#e8b98a';
  const te = (id) => avatar?.complements?.includes(id);
  const faixa = te('faixa-daurada') ? '#f9c22e' : te('faixa') ? equip.faixa : null;
  const contorn = '#1e2733';

  return (
    <svg
      viewBox="0 0 120 150"
      width={mida}
      height={(mida * 150) / 120}
      className={className}
      role={titol ? 'img' : undefined}
      aria-label={titol}
      aria-hidden={titol ? undefined : 'true'}
      focusable="false"
    >
      {/* Cabell llarg: va darrere del cap */}
      {(avatar?.cabellEstil === 'llarg' || avatar?.cabellEstil === 'trenes') && (
        <Cabell estil={avatar.cabellEstil} color={avatar?.cabellColor ?? '#2b2118'} />
      )}

      {/* Peus */}
      {te('espardenyes') ? (
        <g>
          <ellipse cx="49" cy="143" rx="12" ry="5.5" fill="#efe2c4" stroke={contorn} strokeWidth="2" />
          <ellipse cx="71" cy="143" rx="12" ry="5.5" fill="#efe2c4" stroke={contorn} strokeWidth="2" />
          <path d="M44 138 l10 -6 M54 138 l-10 -6 M66 138 l10 -6 M76 138 l-10 -6" stroke={contorn} strokeWidth="1.6" />
        </g>
      ) : (
        <g fill="#ffffff" stroke={contorn} strokeWidth="2">
          <ellipse cx="49" cy="143" rx="12" ry="5.5" />
          <ellipse cx="71" cy="143" rx="12" ry="5.5" />
        </g>
      )}

      {/* Pantalons blancs */}
      <path d="M42 104 h36 l-2 36 h-12 l-4 -22 l-4 22 h-12 Z" fill="#ffffff" stroke={contorn} strokeWidth="2" strokeLinejoin="round" />

      {/* Braç que descansa */}
      <path d="M40 76 C28 82 26 96 30 106" fill="none" stroke={equip.samarreta} strokeWidth="11" strokeLinecap="round" />
      <circle cx="30" cy="108" r="6.5" fill={pell} stroke={contorn} strokeWidth="2" />

      {/* Trofeu a la mà que descansa */}
      {te('trofeu') && (
        <g stroke={contorn} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M18 92 h18 v6 c0 7 -4 11 -9 11 s-9 -4 -9 -11 Z" fill="#f9c22e" />
          <path d="M18 95 c-6 0 -6 9 1 9 M36 95 c6 0 6 9 -1 9" fill="none" />
          <path d="M24 109 h6 v5 h-6 Z M20 114 h14 v4 h-14 Z" fill="#f9c22e" />
        </g>
      )}

      {/* Cos: samarreta de l'equip */}
      <path d="M40 70 C40 64 80 64 80 70 L82 106 H38 Z" fill={equip.samarreta} stroke={contorn} strokeWidth="2" strokeLinejoin="round" />
      <path d="M52 66 L60 76 L68 66" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Faixa */}
      {faixa && (
        <g stroke={contorn} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M38 96 h44 v10 h-44 Z" fill={faixa} />
          <path d="M72 106 l3 16 l7 -3 l-2 -13 Z" fill={faixa} />
        </g>
      )}

      {/* Braç alçat, a punt de colpejar */}
      <path d="M80 76 C92 72 98 62 98 50" fill="none" stroke={equip.samarreta} strokeWidth="11" strokeLinecap="round" />
      {te('guant') ? (
        <g stroke={contorn} strokeWidth="2" strokeLinejoin="round">
          <path d="M90 48 c0 -10 16 -10 16 0 v6 c0 6 -16 6 -16 0 Z" fill="#8a5a2b" />
          <path d="M91 50 h14" stroke="#ffffff" strokeWidth="2.6" />
          <path d="M92 44 h12" stroke="#ffffff" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <circle cx="98" cy="48" r="7" fill={pell} stroke={contorn} strokeWidth="2" />
          {te('didals') && (
            <path d="M93 44.5 h10 M92.2 48 h11.6" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          )}
        </g>
      )}

      {/* La pilota */}
      <g>
        <circle cx="108" cy="26" r="6.5" fill="#fdfdfb" stroke={contorn} strokeWidth="2" />
        <path d="M104 22.5 c3 2 3 5 0 7 M112 22.5 c-3 2 -3 5 0 7" fill="none" stroke={contorn} strokeWidth="1" />
      </g>

      {/* Coll i cap */}
      <rect x="54" y="60" width="12" height="10" rx="4" fill={pell} stroke={contorn} strokeWidth="2" />
      <circle cx="60" cy="42" r="25" fill={pell} stroke={contorn} strokeWidth="2" />

      {/* Mocador al coll */}
      {te('mocador') && (
        <g stroke={contorn} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M46 64 C54 70 66 70 74 64 L60 84 Z" fill="#f9c22e" />
          <circle cx="60" cy="72" r="1.6" fill={contorn} stroke="none" />
          <circle cx="55" cy="68.5" r="1.3" fill={contorn} stroke="none" />
          <circle cx="65" cy="68.5" r="1.3" fill={contorn} stroke="none" />
        </g>
      )}

      {/* Cabell de davant */}
      {avatar?.cabellEstil !== 'llarg' && avatar?.cabellEstil !== 'trenes' ? (
        <Cabell estil={avatar?.cabellEstil ?? 'curt'} color={avatar?.cabellColor ?? '#2b2118'} />
      ) : (
        <path d="M34 44 C30 3 90 3 86 44 C76 31 44 31 34 44 Z" fill={avatar?.cabellColor ?? '#2b2118'} />
      )}

      {/* Cara */}
      <circle cx="51" cy="44" r="3" fill={contorn} />
      <circle cx="69" cy="44" r="3" fill={contorn} />
      <circle cx="45" cy="52" r="4" fill="#e2725b" opacity="0.35" />
      <circle cx="75" cy="52" r="4" fill="#e2725b" opacity="0.35" />
      <path d="M52 54 Q60 61 68 54" fill="none" stroke={contorn} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
