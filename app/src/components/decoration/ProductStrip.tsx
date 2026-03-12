const STRIP_IMAGES = [
  '/assets/conta-em-dolares.webp',
  '/assets/tarjeta-eldorado.webp',
  '/assets/p2p-optimizado.webp',
  '/assets/criptos-disponibles.avif',
  '/assets/mj-st4.webp',
  '/assets/tarjeta.webp',
  '/assets/mj-st5.webp',
  '/assets/mockup-usd.png',
];

export function ProductStrip() {
  // Duplicate for seamless loop
  const images = [...STRIP_IMAGES, ...STRIP_IMAGES];

  return (
    <div className="shrink-0 overflow-hidden border-b border-border-default/30 bg-bg-primary relative">
      {/* Gradient fades on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-bg-primary to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-bg-primary to-transparent" />

      <div className="flex gap-3 py-2 animate-scroll">
        {images.map((src, i) => (
          <div
            key={i}
            className="shrink-0 w-16 h-10 rounded-lg overflow-hidden opacity-30"
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
