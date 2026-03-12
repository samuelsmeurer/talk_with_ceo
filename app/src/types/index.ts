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

// Admin types

export interface AdminConversation {
  id: string;
  user_id: string;
  external_id: string;
  email: string | null;
  rating: number | null;
  status: 'active' | 'closed' | 'ticket_opened';
  message_count: string;
  created_at: string;
  updated_at: string;
}

export interface AdminMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ceo' | 'system';
  text: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface CeoNote {
  id: string;
  conversation_id: string;
  text: string;
  created_at: string;
}
