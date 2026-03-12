import { motion } from 'framer-motion';
import { MoodPill } from './MoodPill';
import { MOOD_OPTIONS } from '../../constants';
import { useStore } from '../../store';

export function MoodSelector() {
  const mood = useStore((s) => s.mood);
  const setMood = useStore((s) => s.setMood);

  return (
    <motion.div
      className="shrink-0 px-5 py-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <p className="text-xs text-text-muted mb-2">¿Qué onda hoy?</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {MOOD_OPTIONS.map((option) => (
          <MoodPill
            key={option.type}
            option={option}
            selected={mood === option.type}
            onSelect={() => setMood(option.type)}
          />
        ))}
      </div>
    </motion.div>
  );
}
