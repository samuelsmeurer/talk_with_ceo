import type { MoodOption, Message } from './types';

export const CEO_NAME = 'Guille';

/** Format a name: first word only, first letter uppercase, rest lowercase */
export function formatFirstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] || '';
  if (!first) return '';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

/** Build the greeting message (shown before video) */
export function buildGreetingMessage(name: string): Message {
  const formatted = formatFirstName(name) || 'crack';
  return {
    id: 'ceo-greeting',
    text: `¡Hola ${formatted}, ¿todo bien? Acá Guillermo, CEO de El Dorado. Grabé algo para vos, te mando un video.`,
    sender: 'ceo',
  };
}

/** Default engagement message (when Redash data is not available) */
export const DEFAULT_ENGAGEMENT_MESSAGE: Message = {
  id: 'ceo-engagement',
  text: 'Estoy muy contento de hablar con vos. Me importa mucho tu punto de vista.',
  sender: 'ceo',
};

/** Final message — always shown last */
export const CEO_FINAL_MESSAGE: Message = {
  id: 'ceo-final',
  text: 'Quiero escucharte personalmente — contame lo que quieras.',
  sender: 'ceo',
};

export const MOOD_OPTIONS: MoodOption[] = [
  { type: 'idea', label: 'Tengo una idea', icon: '💡', color: '#FFFF00' },
  { type: 'positive', label: 'Algo positivo', icon: '❤️', color: '#00FF88' },
  { type: 'frustrated', label: 'Estoy frustrado', icon: '😤', color: '#FF4444' },
  { type: 'talk', label: 'Solo quiero hablar', icon: '💬', color: '#4488FF' },
];

export const CEO_CONFIRMATION_MESSAGE =
  '¡Listo! Ya lo recibí. Lo voy a leer personalmente. Gracias por tomarte el tiempo.';

export const TYPING_DELAYS = {
  firstBubble: 800,
  betweenBubbles: 1200,
  typingDuration: 1000,
  confirmationDelay: 600,
};
