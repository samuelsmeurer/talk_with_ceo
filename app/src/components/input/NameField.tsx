import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';

export function NameField() {
  const [expanded, setExpanded] = useState(false);
  const userName = useStore((s) => s.userName);
  const setUserName = useStore((s) => s.setUserName);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs text-text-muted hover:text-text-secondary transition-colors px-5"
      >
        + Agregar tu nombre (opcional)
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.input
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Tu nombre"
        className="w-full text-sm bg-transparent text-text-primary placeholder-text-muted outline-none px-5 pb-2 border-b border-border-default/50"
        autoFocus
      />
    </AnimatePresence>
  );
}
