import { motion } from 'framer-motion';
import { AvatarCircle } from './AvatarCircle';

interface ChatBubbleProps {
  text: string;
  sender: 'ceo' | 'user';
  showAvatar?: boolean;
  animate?: boolean;
}

export function ChatBubble({ text, sender, showAvatar = false, animate = true }: ChatBubbleProps) {
  const isCeo = sender === 'ceo';

  return (
    <motion.div
      className={`flex items-end gap-2 ${isCeo ? '' : 'justify-end'}`}
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {isCeo && showAvatar && <AvatarCircle />}
      {isCeo && !showAvatar && <div className="w-9 shrink-0" />}

      <div
        className={
          isCeo
            ? 'rounded-2xl rounded-bl-sm'
            : 'rounded-2xl rounded-br-sm font-medium'
        }
        style={{
          maxWidth: '65%',
          padding: '10px 16px',
          fontSize: 14,
          lineHeight: 1.55,
          backgroundColor: isCeo ? '#1f1f1f' : '#FFFF00',
          color: isCeo ? '#ffffff' : '#0a0a0a',
          border: isCeo ? '1px solid rgba(60, 60, 60, 0.6)' : 'none',
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}
