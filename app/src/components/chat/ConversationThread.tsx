import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatBubble } from './ChatBubble';
import { VideoBubble } from './VideoBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatWallpaper } from './ChatWallpaper';
import { useStore } from '../../store';
import type { Message } from '../../types';

interface ConversationThreadProps {
  ceoMessages: Message[];
  visibleCount: number;
  isTyping: boolean;
  confirmationMessage?: Message | null;
  isConfirmationTyping?: boolean;
}

export function ConversationThread({
  ceoMessages,
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

  // Sequence: 1=greeting text, 2=video, 3=engagement text, 4=final text
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto relative" style={{ padding: '16px 24px' }}>
      <ChatWallpaper />

      <div className="relative" style={{ zIndex: 1 }}>
      {visibleCount >= 1 && (
        <p className="text-center text-xs text-text-muted mb-4">hace un momento</p>
      )}

      <div className="flex flex-col gap-3">
        {/* 1. Greeting text (before video) */}
        <AnimatePresence>
          {visibleCount >= 1 && ceoMessages[0] && (
            <ChatBubble
              key={ceoMessages[0].id}
              text={ceoMessages[0].text}
              sender="ceo"
            />
          )}
        </AnimatePresence>

        {/* 2. Video */}
        <AnimatePresence>
          {visibleCount >= 2 && <VideoBubble key="video" showAvatar />}
        </AnimatePresence>

        {/* 3. Engagement text (after video) */}
        <AnimatePresence>
          {visibleCount >= 3 && ceoMessages[1] && (
            <ChatBubble
              key={ceoMessages[1].id}
              text={ceoMessages[1].text}
              sender="ceo"
            />
          )}
        </AnimatePresence>

        {/* 4. Final message */}
        <AnimatePresence>
          {visibleCount >= 4 && ceoMessages[2] && (
            <ChatBubble
              key={ceoMessages[2].id}
              text={ceoMessages[2].text}
              sender="ceo"
            />
          )}
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
