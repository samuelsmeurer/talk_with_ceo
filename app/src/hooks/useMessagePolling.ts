import { useEffect, useRef } from 'react';
import { getMessages } from '../api/client';
import type { ServerMessage } from '../api/client';

const POLL_INTERVAL = 5000;

export function useMessagePolling(
  conversationId: string,
  enabled: boolean,
  onNewMessages: (messages: ServerMessage[]) => void,
) {
  const lastTimestampRef = useRef<string | null>(null);

  // Reset timestamp when conversationId changes
  useEffect(() => {
    lastTimestampRef.current = null;
  }, [conversationId]);

  useEffect(() => {
    if (!enabled || !conversationId) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const msgs = await getMessages(
          conversationId,
          lastTimestampRef.current ?? undefined,
        );
        if (cancelled) return;

        // Filter only admin CEO replies (skip auto-generated ones already shown locally)
        const adminReplies = msgs.filter(
          (m) =>
            m.sender === 'ceo' &&
            m.metadata &&
            (m.metadata as Record<string, unknown>).source === 'admin',
        );

        if (adminReplies.length > 0) {
          lastTimestampRef.current = adminReplies[adminReplies.length - 1].created_at;
          onNewMessages(adminReplies);
        }
      } catch {
        // Polling failure is non-critical
      }
    };

    const id = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [conversationId, enabled, onNewMessages]);
}
