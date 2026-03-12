import { motion } from 'framer-motion';

const FLOATING_IMAGES = [
  { src: '/assets/conta-em-dolares.webp', alt: 'Cuenta USD' },
  { src: '/assets/tarjeta-eldorado.webp', alt: 'Tarjeta' },
  { src: '/assets/p2p-optimizado.webp', alt: 'P2P' },
  { src: '/assets/criptos-disponibles.avif', alt: 'Cripto' },
  { src: '/assets/tarjeta.webp', alt: 'Tarjeta' },
  { src: '/assets/mj-st4.webp', alt: 'El Dorado' },
  { src: '/assets/mockup-usd.png', alt: 'USD' },
  { src: '/assets/mj-st5.webp', alt: 'El Dorado' },
];

// Predefined positions for each card (left and right of center)
const POSITIONS = [
  { left: '2%',  top: '8%',  rotate: -12, size: 120 },
  { right: '2%', top: '5%',  rotate: 8,   size: 110 },
  { left: '5%',  top: '32%', rotate: 6,   size: 100 },
  { right: '4%', top: '28%', rotate: -10, size: 115 },
  { left: '1%',  top: '55%', rotate: -5,  size: 105 },
  { right: '1%', top: '52%', rotate: 12,  size: 95  },
  { left: '6%',  top: '76%', rotate: 8,   size: 110 },
  { right: '5%', top: '78%', rotate: -8,  size: 100 },
];

export function FloatingAssets() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
      {FLOATING_IMAGES.map((img, i) => {
        const pos = POSITIONS[i];
        return (
          <motion.div
            key={i}
            className="absolute rounded-xl overflow-hidden opacity-[0.07]"
            style={{
              left: pos.left,
              right: (pos as { right?: string }).right,
              top: pos.top,
              width: pos.size,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 0.07,
              scale: 1,
              rotate: [pos.rotate, pos.rotate + 3, pos.rotate],
              y: [0, -8, 0],
            }}
            transition={{
              opacity: { duration: 1, delay: i * 0.15 },
              scale: { duration: 1, delay: i * 0.15 },
              rotate: { duration: 6 + i, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-auto rounded-xl"
              loading="lazy"
            />
          </motion.div>
        );
      })}
    </div>
  );
}
