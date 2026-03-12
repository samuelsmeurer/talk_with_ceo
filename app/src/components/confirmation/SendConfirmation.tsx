import { motion } from 'framer-motion';

interface SendConfirmationProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SendConfirmation({ message, onConfirm, onCancel }: SendConfirmationProps) {
  const displayText = message.length > 120 ? message.slice(0, 120) + '...' : message;

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
          style={{ fontSize: 18, marginBottom: 16 }}
        >
          ¿Estás seguro de que querés enviar este mensaje?
        </h2>

        <div
          className="rounded-xl bg-bg-primary border border-border-default text-text-secondary"
          style={{ padding: '12px 16px', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}
        >
          "{displayText}"
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full rounded-full font-semibold"
            style={{
              backgroundColor: '#FFFF00',
              color: '#000000',
              padding: '14px 0',
              fontSize: 15,
            }}
          >
            Sí, enviar
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-full font-semibold text-text-primary border border-border-default transition-colors hover:bg-bg-surface-hover"
            style={{
              backgroundColor: 'transparent',
              padding: '14px 0',
              fontSize: 15,
            }}
          >
            Quiero modificar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
