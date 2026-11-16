/** Pilota de vaqueta: xicoteta, de cuiro, cosida en gallons. */
export default function Pilota({ mida = 24, className = '', buida = false }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={mida}
      height={mida}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="16"
        cy="16"
        r="14"
        fill={buida ? 'transparent' : '#fdfdfb'}
        stroke="#1e2733"
        strokeWidth="2.5"
        strokeDasharray={buida ? '4 4' : undefined}
      />
      {!buida && (
        <g fill="none" stroke="#1e2733" strokeWidth="1.6" strokeLinecap="round">
          <path d="M6 9 C12 13 12 19 6 23" />
          <path d="M26 9 C20 13 20 19 26 23" />
          <path d="M9.5 12.5 l2.4 -1.2 M10.4 16 h2.6 M9.5 19.5 l2.4 1.2" strokeWidth="1.2" />
          <path d="M22.5 12.5 l-2.4 -1.2 M21.6 16 h-2.6 M22.5 19.5 l-2.4 1.2" strokeWidth="1.2" />
        </g>
      )}
    </svg>
  );
}
