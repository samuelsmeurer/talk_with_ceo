import type { MoodOption, Message } from './types';

export const CEO_NAME = 'Guille';

export const CEO_MESSAGES: Message[] = [
  {
    id: 'ceo-1',
    text: '¡Hola! Soy Guille, el CEO de El Dorado.',
    sender: 'ceo',
  },
  {
    id: 'ceo-2',
    text: 'Creé este espacio para escucharte directamente. Sin filtros, sin intermediarios.',
    sender: 'ceo',
  },
  {
    id: 'ceo-3',
    text: 'Contame lo que sea — una idea, algo que te frustró, algo que te gustó, o simplemente lo que tengas ganas de decir.',
    sender: 'ceo',
  },
];

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
