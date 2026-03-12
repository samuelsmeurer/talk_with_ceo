import { useState } from 'react';
import { motion } from 'framer-motion';

interface RatingPopupProps {
  onRate: (rating: number) => void;
  onSkip: () => void;
}

export function RatingPopup({ onRate, onSkip }: RatingPopupProps) {
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleRate = async () => {
    if (selected === 0 || loading) return;
    setLoading(true);
    onRate(selected);
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
        className="w-full rounded-2xl bg-bg-surface border border-border-default text-center"
        style={{ maxWidth: 360, margin: '0 24px', padding: '32px 24px' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <h2
          className="text-text-primary font-semibold"
          style={{ fontSize: 18, marginBottom: 24 }}
        >
          ¿Cómo fue tu experiencia?
        </h2>

        <div className="flex justify-center" style={{ gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setSelected(star)}
              className="transition-transform hover:scale-110"
              style={{
                fontSize: 36,
                color: star <= selected ? '#FFFF00' : '#333333',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ★
            </button>
          ))}
        </div>

        <button
          onClick={handleRate}
          disabled={selected === 0 || loading}
          className="w-full rounded-full font-semibold transition-opacity disabled:opacity-40"
          style={{
            backgroundColor: '#FFFF00',
            color: '#000000',
            padding: '14px 0',
            fontSize: 15,
            marginBottom: 12,
          }}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>

        <button
          onClick={onSkip}
          className="text-text-secondary transition-colors hover:text-text-primary"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Omitir
        </button>
      </motion.div>
    </motion.div>
  );
}
