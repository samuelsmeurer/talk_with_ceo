import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';

export function EmailFollowUp() {
  const userEmail = useStore((s) => s.userEmail);
  const setUserEmail = useStore((s) => s.setUserEmail);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (userEmail.trim() && userEmail.includes('@')) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-text-secondary text-center mt-3"
      >
        ¡Perfecto! Si Guille quiere responderte, ya sabe donde encontrarte.
      </motion.p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="mt-4 px-4"
    >
      <p className="text-xs text-text-muted mb-2 text-center">
        Si querés que Guille te responda, dejanos tu email
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="tu@email.com"
          className="flex-1 bg-bg-surface text-text-primary placeholder-text-muted text-sm rounded-full px-5 py-2.5 outline-none border border-border-default focus:border-border-focus transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={!userEmail.trim() || !userEmail.includes('@')}
          className="shrink-0 text-sm font-medium text-bg-primary bg-accent-primary rounded-full px-5 py-2.5 disabled:opacity-30 transition-opacity"
        >
          Enviar
        </button>
      </div>
    </motion.div>
  );
}
