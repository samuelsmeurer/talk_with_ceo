import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface VideoIntroProps {
  onContinue: () => void;
}

export function VideoIntro({ onContinue }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasEnded, setHasEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    setHasEnded(true);
  };

  return (
    <motion.div
      className="h-full w-full flex flex-col items-center justify-center bg-bg-primary px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Video container */}
      <div className="w-full max-w-[340px] relative">
        {/* Label */}
        <motion.p
          className="text-center text-text-secondary text-sm mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Un mensaje de Guille para vos
        </motion.p>

        {/* Video frame */}
        <motion.div
          className="relative rounded-2xl overflow-hidden border border-border-default/50 bg-bg-surface aspect-[9/16]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
        >
          <video
            ref={videoRef}
            src="/assets/video_guille.mp4"
            className="w-full h-full object-cover"
            playsInline
            onEnded={handleEnded}
            onClick={() => {
              if (!isPlaying) handlePlay();
            }}
          />

          {/* Play overlay */}
          {!isPlaying && (
            <motion.button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-16 h-16 rounded-full bg-accent-primary/90 flex items-center justify-center shadow-lg shadow-accent-primary/20">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-bg-primary ml-1">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              </div>
            </motion.button>
          )}

          {/* Guille name tag */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-online-green" />
            <span className="text-xs font-medium text-white">Guille — CEO</span>
          </div>
        </motion.div>
      </div>

      {/* Continue button */}
      <motion.button
        onClick={onContinue}
        className="mt-6 text-sm font-medium px-6 py-3 rounded-full transition-all duration-200"
        initial={{ opacity: 0, y: 10 }}
        animate={hasEnded ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 0 }}
        transition={{ delay: hasEnded ? 0 : 0.6 }}
        style={{
          backgroundColor: hasEnded ? 'var(--color-accent-primary)' : 'var(--color-bg-surface)',
          color: hasEnded ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)',
          boxShadow: hasEnded ? '0 0 20px rgba(255, 255, 0, 0.2)' : 'none',
        }}
      >
        {hasEnded ? 'Escribile a Guille' : 'Saltar video'}
      </motion.button>
    </motion.div>
  );
}
