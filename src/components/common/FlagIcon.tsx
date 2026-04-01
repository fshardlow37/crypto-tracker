interface FlagIconProps {
  code: string;
  size?: number;
}

const FLAGS: Record<string, (w: number, h: number) => React.ReactNode> = {
  US: (w, h) => (
    <>
      <rect width={w} height={h} fill="#B22234" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * h) / 13} width={w} height={h / 13} fill={i % 2 === 0 ? '#B22234' : '#fff'} />
      ))}
      <rect width={w * 0.4} height={h * 0.54} fill="#3C3B6E" />
    </>
  ),
  CN: (w, h) => (
    <>
      <rect width={w} height={h} fill="#DE2910" />
      <polygon points={`${w * 0.2},${h * 0.15} ${w * 0.23},${h * 0.25} ${w * 0.33},${h * 0.25} ${w * 0.25},${h * 0.32} ${w * 0.28},${h * 0.42} ${w * 0.2},${h * 0.35} ${w * 0.12},${h * 0.42} ${w * 0.15},${h * 0.32} ${w * 0.07},${h * 0.25} ${w * 0.17},${h * 0.25}`} fill="#FFDE00" />
    </>
  ),
  JP: (w, h) => (
    <>
      <rect width={w} height={h} fill="#fff" />
      <circle cx={w / 2} cy={h / 2} r={h * 0.3} fill="#BC002D" />
    </>
  ),
  EU: (w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = h * 0.32;
    const stars = Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
    return (
      <>
        <rect width={w} height={h} fill="#003399" />
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={h * 0.05} fill="#FFCC00" />
        ))}
      </>
    );
  },
  GB: (w, h) => (
    <>
      <rect width={w} height={h} fill="#012169" />
      <line x1="0" y1="0" x2={w} y2={h} stroke="#fff" strokeWidth={h * 0.12} />
      <line x1={w} y1="0" x2="0" y2={h} stroke="#fff" strokeWidth={h * 0.12} />
      <line x1="0" y1="0" x2={w} y2={h} stroke="#C8102E" strokeWidth={h * 0.06} />
      <line x1={w} y1="0" x2="0" y2={h} stroke="#C8102E" strokeWidth={h * 0.06} />
      <rect x={w * 0.4} y="0" width={w * 0.2} height={h} fill="#fff" />
      <rect x="0" y={h * 0.35} width={w} height={h * 0.3} fill="#fff" />
      <rect x={w * 0.43} y="0" width={w * 0.14} height={h} fill="#C8102E" />
      <rect x="0" y={h * 0.38} width={w} height={h * 0.24} fill="#C8102E" />
    </>
  ),
  BTC: (w, h) => (
    <>
      <rect width={w} height={h} rx={h * 0.2} fill="#F7931A" />
      <text x={w / 2} y={h * 0.72} textAnchor="middle" fill="#fff" fontSize={h * 0.65} fontWeight="bold" fontFamily="sans-serif">B</text>
    </>
  ),
  ZEC: (w, h) => (
    <>
      <rect width={w} height={h} rx={h * 0.2} fill="#ECB244" />
      <text x={w / 2} y={h * 0.72} textAnchor="middle" fill="#fff" fontSize={h * 0.65} fontWeight="bold" fontFamily="sans-serif">Z</text>
    </>
  ),
  OIL: (w, h) => (
    <>
      <rect width={w} height={h} rx={h * 0.2} fill="#1a1a1a" />
      <ellipse cx={w / 2} cy={h * 0.65} rx={w * 0.22} ry={h * 0.18} fill="#a0522d" />
      <path d={`M${w / 2},${h * 0.12} Q${w * 0.7},${h * 0.35} ${w * 0.62},${h * 0.55} A${w * 0.2},${h * 0.25} 0 1,1 ${w * 0.38},${h * 0.55} Q${w * 0.3},${h * 0.35} ${w / 2},${h * 0.12}Z`} fill="#a0522d" />
    </>
  ),
};

export default function FlagIcon({ code, size = 14 }: FlagIconProps) {
  const h = size;
  const w = Math.round(h * 1.5);
  const render = FLAGS[code];
  if (!render) return <span>{code}</span>;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ flexShrink: 0, borderRadius: 2, display: 'block' }}
    >
      {render(w, h)}
    </svg>
  );
}
