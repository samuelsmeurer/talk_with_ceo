import { useState, useCallback, useRef, useEffect } from 'react';
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

  // Promise ref so handleConfirmSend can await the real userId if needed
  const apiPromiseRef = useRef<Promise<string> | null>(null);

  const isIdentified = userId !== null;

  // Fires the API call and updates state when it responds (non-blocking)
  const enrichInBackground = useCallback(
    (name: string) => {
      const promise = createOrIdentifyUser(name)
        .then((user) => {
          // Update with real backend ID
          setUserId(user.id);
          storeSetUserId(user.id);
          try {
            localStorage.setItem(USER_ID_KEY, user.id);
          } catch {
            // storage unavailable
          }

          if (user.engagement) {
            setEngagement(user.engagement);
          }

          return user.id;
        })
        .catch(() => {
          // API unavailable — keep existing ID
          return userId ?? `local-${Date.now()}`;
        });

      apiPromiseRef.current = promise;
      return promise;
    },
    [storeSetUserId, userId],
  );

  // Returning user: fetch engagement in background on mount
  useEffect(() => {
    if (!userName || engagement) return;
    enrichInBackground(userName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  // New user: return immediately with temp ID, enrich in background
  const identify = useCallback(
    (name: string): string => {
      const tempId = `pending-${Date.now()}`;

      // Set state immediately — popup closes, chat starts
      setUserId(tempId);
      setUserName(name);
      storeSetUserId(tempId);
      storeSetUserName(name);

      try {
        localStorage.setItem(USER_ID_KEY, tempId);
        localStorage.setItem(USER_NAME_KEY, name);
      } catch {
        // storage unavailable
      }

      // Fire API call in background — updates userId + engagement when ready
      enrichInBackground(name);

      return tempId;
    },
    [storeSetUserId, storeSetUserName, enrichInBackground],
  );

  // Await the real userId (for when we need it before sending a message)
  const awaitRealUserId = useCallback(async (): Promise<string> => {
    if (apiPromiseRef.current) {
      return apiPromiseRef.current;
    }
    return userId ?? '';
  }, [userId]);

  return { userId, userName, isIdentified, identify, engagement, awaitRealUserId };
}
