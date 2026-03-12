const WALLPAPER_ITEMS = [
  // Row 1
  { src: '/assets/tarjeta.webp', top: '1%', left: '3%', rotate: -12, size: 72 },
  { src: '/assets/mj-st4.webp', top: '4%', left: '38%', rotate: 5, size: 65 },
  { src: '/assets/conta-em-dolares.webp', top: '2%', right: '5%', rotate: 10, size: 70 },
  // Row 2
  { src: '/assets/p2p-optimizado.webp', top: '16%', left: '15%', rotate: -8, size: 68 },
  { src: '/assets/tarjeta.webp', top: '18%', right: '18%', rotate: 14, size: 66 },
  // Row 3
  { src: '/assets/mj-st4.webp', top: '30%', left: '0%', rotate: 7, size: 70 },
  { src: '/assets/conta-em-dolares.webp', top: '33%', left: '42%', rotate: -10, size: 64 },
  { src: '/assets/p2p-optimizado.webp', top: '31%', right: '2%', rotate: 12, size: 68 },
  // Row 4
  { src: '/assets/tarjeta.webp', top: '46%', left: '12%', rotate: -6, size: 66 },
  { src: '/assets/mj-st4.webp', top: '48%', right: '12%', rotate: 9, size: 64 },
  // Row 5
  { src: '/assets/conta-em-dolares.webp', top: '60%', left: '2%', rotate: 11, size: 70 },
  { src: '/assets/p2p-optimizado.webp', top: '62%', left: '35%', rotate: -7, size: 65 },
  { src: '/assets/tarjeta.webp', top: '60%', right: '4%', rotate: -13, size: 68 },
  // Row 6
  { src: '/assets/mj-st4.webp', top: '75%', left: '18%', rotate: 8, size: 66 },
  { src: '/assets/conta-em-dolares.webp', top: '77%', right: '15%', rotate: -10, size: 70 },
  // Row 7
  { src: '/assets/p2p-optimizado.webp', top: '88%', left: '5%', rotate: -5, size: 68 },
  { src: '/assets/tarjeta.webp', top: '90%', left: '40%', rotate: 12, size: 64 },
  { src: '/assets/mj-st4.webp', top: '89%', right: '3%', rotate: -8, size: 66 },
];

export function ChatWallpaper() {
  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {WALLPAPER_ITEMS.map((item, i) => (
        <img
          key={i}
          src={item.src}
          alt=""
          loading="lazy"
          style={{
            position: 'absolute',
            top: item.top,
            left: (item as { left?: string }).left,
            right: (item as { right?: string }).right,
            width: item.size,
            transform: `rotate(${item.rotate}deg)`,
            opacity: 0.35,
            borderRadius: 10,
            filter: 'saturate(0.8)',
          }}
        />
      ))}
    </div>
  );
}
