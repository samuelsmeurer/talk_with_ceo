import { create } from 'zustand';
import type { AppState, MoodType, Message } from './types';

interface AppStore {
  state: AppState;
  mood: MoodType;
  messages: Message[];
  userName: string;
  userEmail: string;
  userId: string;
  conversationId: string;
  setState: (state: AppState) => void;
  setMood: (mood: MoodType) => void;
  addMessage: (message: Message) => void;
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setUserId: (id: string) => void;
  setConversationId: (id: string) => void;
}

export const useStore = create<AppStore>((set) => ({
  state: 'splash',
  mood: null,
  messages: [],
  userName: '',
  userEmail: '',
  userId: '',
  conversationId: '',
  setState: (state) => set({ state }),
  setMood: (mood) => set((s) => ({ mood: s.mood === mood ? null : mood })),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setUserName: (userName) => set({ userName }),
  setUserEmail: (userEmail) => set({ userEmail }),
  setUserId: (userId) => set({ userId }),
  setConversationId: (conversationId) => set({ conversationId }),
}));
