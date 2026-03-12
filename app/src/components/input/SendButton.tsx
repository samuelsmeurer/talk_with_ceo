import { motion } from 'framer-motion';

interface SendButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function SendButton({ disabled, onClick }: SendButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.88 } : undefined}
      className="shrink-0 w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center transition-all duration-200 disabled:opacity-20"
      style={{
        boxShadow: disabled ? 'none' : '0 0 16px rgba(255, 255, 0, 0.25)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-bg-primary">
        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.button>
  );
}
