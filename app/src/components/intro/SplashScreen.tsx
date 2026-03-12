import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FloatingAssets } from './FloatingAssets';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center z-50"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Floating product assets in background */}
      <FloatingAssets opacity={0.08} animate />

      {/* Logo + loader in center */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.img
          src="/assets/logo.svg"
          alt="El Dorado"
          className="h-12 w-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 1, 1, 0.8],
            scale: [0.8, 1.05, 1, 1],
          }}
          transition={{
            duration: 1.8,
            ease: 'easeOut',
          }}
        />
        <motion.div
          className="mt-6 h-0.5 bg-accent-primary/30 rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        >
          <motion.div
            className="h-full bg-accent-primary rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
