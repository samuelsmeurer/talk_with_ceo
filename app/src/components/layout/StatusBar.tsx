import { motion } from 'framer-motion';
import { CEO_NAME } from '../../constants';

export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-bg-primary border-b border-border-default/50 shrink-0" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      {/* Back arrow (decorative) */}
      <button className="text-text-secondary p-1" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Center: CEO info */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-semibold text-text-primary">{CEO_NAME}</span>
          <motion.div
            className="w-2 h-2 rounded-full bg-online-green"
            animate={{ opacity: [1, 0.5, 1], scale: [1, 1.3, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <span className="text-xs text-text-muted">CEO, El Dorado</span>
      </div>

      {/* Right: Logo */}
      <img src="/assets/logo.svg" alt="El Dorado" className="h-6 w-auto opacity-60" />
    </div>
  );
}
