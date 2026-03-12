import { motion } from 'framer-motion';
import type { MoodOption } from '../../types';

interface MoodPillProps {
  option: MoodOption;
  selected: boolean;
  onSelect: () => void;
}

export function MoodPill({ option, selected, onSelect }: MoodPillProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.93 }}
      className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border"
      style={{
        backgroundColor: selected ? `${option.color}15` : 'var(--color-bg-surface)',
        borderColor: selected ? option.color : 'var(--color-border-default)',
        borderLeftWidth: '3px',
        borderLeftColor: option.color,
        color: selected ? option.color : 'var(--color-text-primary)',
      }}
    >
      <span>{option.icon}</span>
      <span>{option.label}</span>
    </motion.button>
  );
}
