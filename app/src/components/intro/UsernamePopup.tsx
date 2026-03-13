import { useState } from 'react';
import { motion } from 'framer-motion';

interface UsernamePopupProps {
  onComplete: (userId: string) => void;
  identify: (name: string) => string;
}

export function UsernamePopup({ onComplete, identify }: UsernamePopupProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const userId = identify(trimmed);
    onComplete(userId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full rounded-2xl bg-bg-surface border border-border-default"
        style={{ maxWidth: 360, margin: '0 24px', padding: '32px 24px' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <h2
          className="text-text-primary font-semibold text-center"
          style={{ fontSize: 20, marginBottom: 8 }}
        >
          ¿Cómo te llaman?
        </h2>
        <p
          className="text-text-secondary text-center"
          style={{ fontSize: 14, marginBottom: 24 }}
        >
          Tu nombre aparecerá en el mensaje para Guille
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tu nombre..."
          autoFocus
          className="w-full bg-bg-surface text-text-primary placeholder-text-muted rounded-xl outline-none border border-border-default focus:border-border-focus transition-colors"
          style={{ padding: '12px 16px', fontSize: 15, marginBottom: 16 }}
        />

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full rounded-full font-semibold transition-opacity disabled:opacity-40"
          style={{
            backgroundColor: '#FFFF00',
            color: '#000000',
            padding: '14px 0',
            fontSize: 15,
          }}
        >
          Continuar
        </button>
      </motion.div>
    </motion.div>
  );
}
