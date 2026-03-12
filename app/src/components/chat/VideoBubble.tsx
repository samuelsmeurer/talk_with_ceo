import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AvatarCircle } from './AvatarCircle';

interface VideoBubbleProps {
  showAvatar?: boolean;
}

export function VideoBubble({ showAvatar = true }: VideoBubbleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setHasEnded(true);
  };

  return (
    <motion.div
      className="flex items-start gap-2"
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {showAvatar && <div className="pt-1"><AvatarCircle /></div>}
      {!showAvatar && <div className="w-9 shrink-0" />}

      {/* Video message bubble */}
      <div
        className="rounded-2xl rounded-tl-sm overflow-hidden bg-bg-surface border border-border-default/50 relative cursor-pointer"
        style={{ width: 200 }}
        onClick={togglePlay}
      >
        <div className="relative" style={{ aspectRatio: '9/14', maxHeight: 300 }}>
          <video
            ref={videoRef}
            src="/assets/video_guille.mp4"
            className="w-full h-full object-cover"
            playsInline
            onEnded={handleEnded}
          />

          {/* Play/Pause overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/20"
            animate={{ opacity: isPlaying ? 0 : 1 }}
          >
            <motion.div
              className="w-12 h-12 rounded-full bg-accent-primary/90 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              style={{ boxShadow: '0 0 20px rgba(255, 255, 0, 0.3)' }}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-bg-primary">
                  <rect x="6" y="4" width="4" height="16" fill="currentColor" rx="1" />
                  <rect x="14" y="4" width="4" height="16" fill="currentColor" rx="1" />
                </svg>
              ) : hasEnded ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-bg-primary">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-bg-primary ml-0.5">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              )}
            </motion.div>
          </motion.div>

          {/* Name tag */}
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1.5 backdrop-blur-sm rounded-full"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(60, 60, 60, 0.6)',
              padding: '5px 12px',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-online-green" />
            <span className="text-[11px] font-medium text-white">Guille</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
