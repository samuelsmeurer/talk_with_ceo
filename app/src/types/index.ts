export type AppState = 'splash' | 'conversation' | 'composing' | 'sent' | 'confirmed';

export type MoodType = 'idea' | 'positive' | 'frustrated' | 'talk' | null;

export interface MoodOption {
  type: MoodType;
  label: string;
  icon: string;
  color: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'ceo' | 'user' | 'system';
  timestamp?: string;
}
