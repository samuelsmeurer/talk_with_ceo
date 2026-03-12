import { useState, useEffect, useCallback } from 'react';
import { TYPING_DELAYS } from '../constants';

interface SequenceState {
  visibleCount: number;
  isTyping: boolean;
  sequenceComplete: boolean;
}

export function useTypingSequence(totalMessages: number, startImmediately = false) {
  const [state, setState] = useState<SequenceState>({
    visibleCount: 0,
    isTyping: false,
    sequenceComplete: false,
  });

  const start = useCallback(() => {
    let currentIndex = 0;

    const showNext = () => {
      if (currentIndex >= totalMessages) {
        setState((s) => ({ ...s, isTyping: false, sequenceComplete: true }));
        return;
      }

      setState((s) => ({ ...s, isTyping: true }));

      setTimeout(() => {
        currentIndex++;
        setState((s) => ({
          ...s,
          visibleCount: currentIndex,
          isTyping: false,
        }));

        setTimeout(showNext, currentIndex < totalMessages ? TYPING_DELAYS.betweenBubbles : 0);
      }, TYPING_DELAYS.typingDuration);
    };

    setTimeout(showNext, TYPING_DELAYS.firstBubble);
  }, [totalMessages]);

  useEffect(() => {
    if (startImmediately) {
      start();
    }
  }, [startImmediately, start]);

  return { ...state, start };
}
