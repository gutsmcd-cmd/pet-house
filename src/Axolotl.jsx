export default function Axolotl({ blinking }) {
  return (
    <svg viewBox="0 0 240 150" className="lotl-svg" aria-hidden="true">
      <g className="mizu-tail">
        <path d="M86 78 C48 62 22 78 10 112 C36 98 58 96 88 94 Z" fill="var(--fin)" />
        <path d="M98 80 C58 82 30 96 16 112" fill="none" stroke="var(--body)" strokeWidth="18" strokeLinecap="round" />
      </g>
      <path d="M104 64 Q128 46 158 58" fill="none" stroke="var(--fin)" strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="124" cy="86" rx="48" ry="27" fill="var(--body)" />
      <ellipse cx="118" cy="98" rx="30" ry="12" fill="var(--belly)" />
      <circle cx="108" cy="76" r="4.5" fill="var(--spot)" />
      <circle cx="132" cy="92" r="3.2" fill="var(--spot)" />
      <circle cx="146" cy="74" r="2.6" fill="var(--spot)" />
      <ellipse cx="168" cy="72" rx="32" ry="25" fill="var(--body)" />
      <ellipse cx="194" cy="80" rx="16" ry="11" fill="var(--body)" />
      <ellipse cx="176" cy="88" rx="12" ry="7" fill="var(--belly)" />
      <path d="M184 86 q7 7 14 1" fill="none" stroke="#6b3a42" strokeWidth="1.6" strokeLinecap="round" />
      <g className={blinking ? 'mizu-blink' : undefined}>
        <circle cx="178" cy="64" r="5.2" fill="#1b1714" />
        <circle cx="180" cy="62" r="1.7" fill="#fff" />
      </g>
      <g className="mizu-gills">
        <path d="M156 52 C140 24 122 28 128 50 C136 36 148 38 156 52" fill="var(--gill)" />
        <path d="M152 60 C132 36 112 50 124 70 C132 56 144 54 152 60" fill="var(--gill)" opacity="0.9" />
        <path d="M150 68 C134 58 118 74 132 86 C138 74 146 70 150 68" fill="var(--gill)" opacity="0.75" />
      </g>
      <g fill="none" stroke="var(--body)" strokeWidth="6" strokeLinecap="round">
        <path d="M108 106 q-8 16 6 16" /><path d="M146 108 q10 14 0 18" />
      </g>
      <g fill="none" stroke="var(--body)" strokeWidth="2.2" strokeLinecap="round">
        <path d="M100 122 l-6 6 M104 124 l0 7 M110 123 l6 5" /><path d="M142 126 l-5 6 M148 128 l2 7 M154 126 l7 4" />
      </g>
    </svg>
  )
}
