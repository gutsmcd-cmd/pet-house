// Drawn corgi (side view). Parts have classes so CSS can animate them.
export default function Corgi({ ball, dead, ears }) {
  return (
    <svg viewBox="0 0 200 150" className={'corgi-svg' + (ears ? ' ears-up' : '')} aria-hidden="true">
      <ellipse cx="100" cy="140" rx="70" ry="8" fill="#0002" className="c-shadow" />
      <g className="c-tail"><ellipse cx="38" cy="78" rx="14" ry="9" fill="#e8913f" /></g>
      <g className="c-leg c-back"><rect x="50" y="100" width="14" height="32" rx="6" fill="#e8913f" /><rect x="50" y="122" width="14" height="10" rx="5" fill="#fff" /></g>
      <g className="c-leg c-back2"><rect x="70" y="102" width="13" height="30" rx="6" fill="#d77f31" /><rect x="70" y="122" width="13" height="10" rx="5" fill="#fff" /></g>
      <ellipse cx="95" cy="88" rx="55" ry="28" fill="#e8913f" />
      <ellipse cx="105" cy="102" rx="38" ry="13" fill="#fff" />
      <g className="c-leg c-front2"><rect x="118" y="102" width="13" height="30" rx="6" fill="#d77f31" /><rect x="118" y="122" width="13" height="10" rx="5" fill="#fff" /></g>
      <g className="c-leg c-paw"><rect x="134" y="100" width="14" height="32" rx="6" fill="#e8913f" /><rect x="134" y="122" width="14" height="10" rx="5" fill="#fff" /></g>
      <g className="c-head">
        <g className="c-ears">
          <path d="M128 40 L134 6 L150 34 Z" fill="#e8913f" /><path d="M132 36 L135 15 L145 32 Z" fill="#f7b6cf" />
          <path d="M150 36 L166 6 L170 40 Z" fill="#d77f31" />
        </g>
        <circle cx="150" cy="56" r="26" fill="#e8913f" />
        <path d="M150 40 C146 52 146 66 152 76 L176 74 C184 70 184 60 176 56 C168 54 158 52 150 40 Z" fill="#fff" />
        <ellipse cx="181" cy="62" rx="6" ry="5" fill="#2a1d17" />
        {dead ? <g stroke="#2a1d17" strokeWidth="3" strokeLinecap="round"><path d="M152 46 l8 8 M160 46 l-8 8" /></g>
          : <g><circle cx="157" cy="50" r="4.5" fill="#2a1d17" /><circle cx="158.5" cy="48.5" r="1.4" fill="#fff" /></g>}
        <path d="M166 72 q8 6 14 0" stroke="#2a1d17" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {dead && <path d="M170 74 q3 10 8 2" fill="#f07aa8" />}
        <circle cx="146" cy="64" r="5" fill="#f7b6cf" opacity=".7" />
        {ball && <circle cx="182" cy="76" r="9" fill="#7ed957" stroke="#3f9b2c" strokeWidth="2" />}
      </g>
    </svg>
  )
}
