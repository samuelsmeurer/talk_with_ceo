import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatBubble } from './ChatBubble';
import { VideoBubble } from './VideoBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatWallpaper } from './ChatWallpaper';
import { CEO_MESSAGES } from '../../constants';
import { useStore } from '../../store';
import type { Message } from '../../types';

interface ConversationThreadProps {
  visibleCount: number;
  isTyping: boolean;
  confirmationMessage?: Message | null;
  isConfirmationTyping?: boolean;
}

export function ConversationThread({
  visibleCount,
  isTyping,
  confirmationMessage,
  isConfirmationTyping,
}: ConversationThreadProps) {
  const messages = useStore((s) => s.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [visibleCount, isTyping, messages.length, confirmationMessage, isConfirmationTyping]);

  // visibleCount: 0 = nothing, 1 = video, 2+ = video + text bubbles
  const showVideo = visibleCount >= 1;
  const textBubbleCount = Math.max(0, visibleCount - 1);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto relative" style={{ padding: '16px 24px' }}>
      <ChatWallpaper />

      {/* Content above wallpaper */}
      <div className="relative" style={{ zIndex: 1 }}>
      {/* Timestamp */}
      {showVideo && (
        <p className="text-center text-xs text-text-muted mb-4">hace un momento</p>
      )}

      <div className="flex flex-col gap-3">
        {/* Video as first message from Guille */}
        <AnimatePresence>
          {showVideo && <VideoBubble key="video" showAvatar />}
        </AnimatePresence>

        {/* CEO Text Messages (after video) */}
        <AnimatePresence>
          {CEO_MESSAGES.slice(0, textBubbleCount).map((msg) => (
            <ChatBubble
              key={msg.id}
              text={msg.text}
              sender="ceo"
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && <TypingIndicator key="typing" showAvatar={visibleCount === 0} />}
        </AnimatePresence>

        {/* User Messages */}
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} text={msg.text} sender={msg.sender} />
          ))}
        </AnimatePresence>

        {/* Post-send: CEO typing then confirmation */}
        <AnimatePresence>
          {isConfirmationTyping && <TypingIndicator key="confirm-typing" showAvatar={false} />}
        </AnimatePresence>
        <AnimatePresence>
          {confirmationMessage && (
            <ChatBubble
              key="confirmation"
              text={confirmationMessage.text}
              sender="ceo"
            />
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
