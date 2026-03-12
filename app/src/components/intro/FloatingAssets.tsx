import { motion } from 'framer-motion';

const FLOATING_ITEMS = [
  { src: '/assets/tarjeta-eldorado.webp', w: 130, delay: 0, x: '-15%', y: '10%', rotate: -12 },
  { src: '/assets/conta-em-dolares.webp', w: 110, delay: 0.3, x: '65%', y: '5%', rotate: 8 },
  { src: '/assets/p2p-optimizado.webp', w: 100, delay: 0.6, x: '70%', y: '55%', rotate: 15 },
  { src: '/assets/criptos-disponibles.avif', w: 105, delay: 0.15, x: '-10%', y: '60%', rotate: -8 },
  { src: '/assets/tarjeta.webp', w: 95, delay: 0.45, x: '55%', y: '82%', rotate: 10 },
  { src: '/assets/tag-usd.svg', w: 70, delay: 0.2, x: '5%', y: '35%', rotate: -5 },
  { src: '/assets/tag-cripto.svg', w: 65, delay: 0.5, x: '75%', y: '32%', rotate: 6 },
  { src: '/assets/tag-p2p.svg', w: 60, delay: 0.35, x: '20%', y: '85%', rotate: -3 },
];

interface FloatingAssetsProps {
  opacity?: number;
  animate?: boolean;
}

export function FloatingAssets({ opacity = 0.12, animate = true }: FloatingAssetsProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {FLOATING_ITEMS.map((item, i) => (
        <motion.img
          key={i}
          src={item.src}
          alt=""
          className="absolute rounded-xl"
          style={{
            width: item.w,
            left: item.x,
            top: item.y,
            filter: 'blur(0.5px)',
          }}
          initial={{ opacity: 0, scale: 0.7, rotate: item.rotate }}
          animate={
            animate
              ? {
                  opacity: opacity,
                  scale: 1,
                  rotate: item.rotate,
                  y: [0, -8, 0, 6, 0],
                }
              : { opacity: opacity, scale: 1, rotate: item.rotate }
          }
          transition={
            animate
              ? {
                  opacity: { delay: item.delay, duration: 0.8 },
                  scale: { delay: item.delay, duration: 0.8, type: 'spring' },
                  y: {
                    delay: item.delay + 0.8,
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }
              : {
                  opacity: { delay: item.delay, duration: 0.6 },
                  scale: { delay: item.delay, duration: 0.6 },
                }
          }
        />
      ))}

      {/* Ambient yellow glow in center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,0,0.04) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
