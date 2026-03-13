import { motion } from 'framer-motion';

interface SupportConfirmationProps {
  onYes: () => void;
  onNo: () => void;
}

export function SupportConfirmation({ onYes, onNo }: SupportConfirmationProps) {
  return (
    <motion.div
      className="shrink-0 border-t border-border-default/50 bg-bg-primary"
      style={{ padding: '16px 20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div className="flex gap-3">
        <button
          onClick={onYes}
          className="flex-1 rounded-full font-semibold relative"
          style={{
            backgroundColor: '#FFFF00',
            color: '#000000',
            padding: '14px 0',
            fontSize: 15,
            boxShadow: '0 0 16px rgba(255, 255, 0, 0.25), 0 0 4px rgba(255, 255, 0, 0.15)',
          }}
        >
          Sí, por favor
        </button>
        <button
          onClick={onNo}
          className="flex-1 rounded-full font-semibold text-text-secondary border border-border-default transition-colors"
          style={{
            backgroundColor: 'transparent',
            padding: '14px 0',
            fontSize: 15,
          }}
        >
          No, está bien
        </button>
      </div>
    </motion.div>
  );
}
