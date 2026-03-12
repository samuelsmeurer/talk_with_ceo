import { motion } from 'framer-motion';

export function SupportRedirect() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="mt-6 text-center"
    >
      <a
        href="https://eldorado.io"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-text-muted hover:text-text-secondary transition-colors underline underline-offset-2"
      >
        ¿Necesitás ayuda técnica? Hablá con soporte
      </a>
    </motion.div>
  );
}
