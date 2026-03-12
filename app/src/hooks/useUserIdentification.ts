import { useState, useCallback } from 'react';
import { useStore } from '../store';
import { createOrIdentifyUser } from '../api/client';
import type { EngagementResult } from '../api/client';

const USER_ID_KEY = 'ceo-chat-user-id';
const USER_NAME_KEY = 'ceo-chat-user-name';

function getStoredUserId(): string | null {
  try {
    return localStorage.getItem(USER_ID_KEY);
  } catch {
    return null;
  }
}

function getStoredUserName(): string | null {
  try {
    return localStorage.getItem(USER_NAME_KEY);
  } catch {
    return null;
  }
}

export function useUserIdentification() {
  const [userId, setUserId] = useState<string | null>(getStoredUserId);
  const [userName, setUserName] = useState<string | null>(getStoredUserName);
  const [engagement, setEngagement] = useState<EngagementResult | null>(null);
  const storeSetUserId = useStore((s) => s.setUserId);
  const storeSetUserName = useStore((s) => s.setUserName);

  const isIdentified = userId !== null;

  const identify = useCallback(
    async (name: string): Promise<string> => {
      let id: string;
      try {
        const user = await createOrIdentifyUser(name);
        id = user.id;
        if (user.engagement) {
          setEngagement(user.engagement);
        }
      } catch {
        id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      }

      try {
        localStorage.setItem(USER_ID_KEY, id);
        localStorage.setItem(USER_NAME_KEY, name);
      } catch {
        // storage unavailable
      }

      setUserId(id);
      setUserName(name);
      storeSetUserId(id);
      storeSetUserName(name);

      return id;
    },
    [storeSetUserId, storeSetUserName]
  );

  return { userId, userName, isIdentified, identify, engagement };
}
