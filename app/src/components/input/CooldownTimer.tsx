import { useState, useEffect } from 'react';

interface CooldownTimerProps {
  cooldownEnd: number;
  onExpired: () => void;
}

export function CooldownTimer({ cooldownEnd, onExpired }: CooldownTimerProps) {
  const [remaining, setRemaining] = useState(() => Math.max(0, cooldownEnd - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, cooldownEnd - Date.now());
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownEnd, onExpired]);

  const totalSeconds = Math.ceil(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div
      className="shrink-0 border-t border-border-default/50 bg-bg-primary"
      style={{ padding: '12px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <div
        className="flex items-center justify-center rounded-3xl bg-bg-surface border border-border-default"
        style={{ padding: '12px 20px' }}
      >
        <p className="text-text-secondary text-center" style={{ fontSize: 14 }}>
          Podés enviar un nuevo mensaje en{' '}
          <span className="text-accent-primary font-semibold">
            {hours}h {pad(minutes)}min {pad(seconds)}seg
          </span>
        </p>
      </div>
    </div>
  );
}
