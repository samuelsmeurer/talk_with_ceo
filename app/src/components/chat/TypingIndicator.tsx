import { motion } from 'framer-motion';
import { AvatarCircle } from './AvatarCircle';

export function TypingIndicator({ showAvatar = true }: { showAvatar?: boolean }) {
  return (
    <motion.div
      className="flex items-end gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {showAvatar && <AvatarCircle />}
      {!showAvatar && <div className="w-9 shrink-0" />}
      <div className="rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1" style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(51, 51, 51, 0.5)' }}>
        <span className="typing-dot w-2 h-2 rounded-full bg-accent-primary inline-block" />
        <span className="typing-dot w-2 h-2 rounded-full bg-accent-primary inline-block" />
        <span className="typing-dot w-2 h-2 rounded-full bg-accent-primary inline-block" />
      </div>
    </motion.div>
  );
}
