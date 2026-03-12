import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { StatusBar } from './components/layout/StatusBar';
import { ConversationThread } from './components/chat/ConversationThread';
import { MessageInput } from './components/input/MessageInput';
import { ConfettiEffect } from './components/confirmation/ConfettiEffect';
import { SplashScreen } from './components/intro/SplashScreen';
import { UsernamePopup } from './components/intro/UsernamePopup';
import { SendConfirmation } from './components/confirmation/SendConfirmation';
import { RatingPopup } from './components/confirmation/RatingPopup';
import { useTypingSequence } from './hooks/useTypingSequence';
import { useFirstVisit } from './hooks/useFirstVisit';
import { useUserIdentification } from './hooks/useUserIdentification';
import { useStore } from './store';
import { playReceived, playSent } from './hooks/useSounds';
import { startConversation, sendMessage, rateConversation } from './api/client';
import { CEO_MESSAGES, CEO_CONFIRMATION_MESSAGE, TYPING_DELAYS } from './constants';
import type { Message } from './types';

export default function App() {
  const { isFirstVisit, markVisited } = useFirstVisit();
  const { userId, isIdentified, identify } = useUserIdentification();

  const [showSplash, setShowSplash] = useState(isFirstVisit);
  const [showUsernamePopup, setShowUsernamePopup] = useState(!isIdentified);
  const [chatStarted, setChatStarted] = useState(!isFirstVisit && isIdentified);
  const [sent, setSent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confirmationTyping, setConfirmationTyping] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<Message | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const [showRating, setShowRating] = useState(false);

  const addMessage = useStore((s) => s.addMessage);
  const mood = useStore((s) => s.mood);
  const setConversationId = useStore((s) => s.setConversationId);
  const setUserId = useStore((s) => s.setUserId);

  // Sync stored userId into Zustand on mount
  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }
  }, [userId, setUserId]);

  // 1 (video) + 3 (text messages) = 4 total items in sequence
  const totalSequenceItems = 1 + CEO_MESSAGES.length;

  const { visibleCount, isTyping, sequenceComplete } = useTypingSequence(
    totalSequenceItems,
    chatStarted
  );

  // Play sound when a new CEO bubble appears
  const prevVisibleCount = useRef(visibleCount);
  useEffect(() => {
    if (visibleCount > prevVisibleCount.current && visibleCount > 1) {
      playReceived();
    }
    prevVisibleCount.current = visibleCount;
  }, [visibleCount]);

  // Play sound when confirmation message arrives
  useEffect(() => {
    if (confirmationMessage) {
      playReceived();
    }
  }, [confirmationMessage]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    markVisited();
    if (isIdentified) {
      setTimeout(() => setChatStarted(true), 300);
    }
  }, [markVisited, isIdentified]);

  const handleUsernameComplete = useCallback(
    (_userId: string) => {
      setShowUsernamePopup(false);
      if (!showSplash) {
        setTimeout(() => setChatStarted(true), 300);
      }
    },
    [showSplash]
  );

  // When splash finishes and user is now identified, start chat
  useEffect(() => {
    if (!showSplash && !showUsernamePopup && !chatStarted) {
      setTimeout(() => setChatStarted(true), 300);
    }
  }, [showSplash, showUsernamePopup, chatStarted]);

  const handleSend = useCallback(
    (text: string) => {
      if (sent) return;
      setPendingMessage(text);
      setShowConfirmation(true);
    },
    [sent]
  );

  const handleConfirmCancel = useCallback(() => {
    setShowConfirmation(false);
    setPendingMessage('');
  }, []);

  const conversationIdRef = useRef('');

  const handleConfirmSend = useCallback(async () => {
    setShowConfirmation(false);
    const text = pendingMessage;
    setPendingMessage('');

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
    };

    addMessage(userMessage);
    playSent();
    setSent(true);

    // Start API calls
    let ceoResponseText = CEO_CONFIRMATION_MESSAGE;

    try {
      const currentUserId = userId || '';
      const conversation = await startConversation(currentUserId);
      conversationIdRef.current = conversation.id;
      setConversationId(conversation.id);

      const result = await sendMessage(conversation.id, text, { mood });
      ceoResponseText = result.ceoResponse.text;
    } catch {
      // API failed — use hardcoded fallback
    }

    setTimeout(() => {
      setConfirmationTyping(true);
    }, TYPING_DELAYS.confirmationDelay);

    setTimeout(() => {
      setConfirmationTyping(false);
      setConfirmationMessage({
        id: 'ceo-confirm',
        text: ceoResponseText,
        sender: 'ceo',
      });
      setShowRating(true);
    }, TYPING_DELAYS.confirmationDelay + TYPING_DELAYS.typingDuration);
  }, [pendingMessage, addMessage, mood, userId, setConversationId]);

  const handleRate = useCallback(
    async (rating: number) => {
      try {
        if (conversationIdRef.current) {
          await rateConversation(conversationIdRef.current, rating);
        }
      } catch {
        // Rating failed silently
      }
      setShowRating(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    },
    []
  );

  const handleSkipRating = useCallback(() => {
    setShowRating(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  }, []);

  return (
    <div className="h-full w-full flex justify-center items-center" style={{ backgroundColor: '#050505' }}>
      <div className="w-full max-w-[480px] h-full md:h-[90vh] md:max-h-[850px] flex flex-col relative md:rounded-3xl md:border md:border-border-default/30 md:shadow-2xl md:shadow-accent-primary/5 overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>

        {/* Splash (first visit only) */}
        <AnimatePresence>
          {showSplash && (
            <SplashScreen key="splash" onComplete={handleSplashComplete} />
          )}
        </AnimatePresence>

        {/* Username popup */}
        <AnimatePresence>
          {showUsernamePopup && !showSplash && (
            <UsernamePopup
              key="username"
              onComplete={handleUsernameComplete}
              identify={identify}
            />
          )}
        </AnimatePresence>

        {/* Chat interface */}
        <StatusBar />

        <ConversationThread
          visibleCount={visibleCount}
          isTyping={isTyping}
          confirmationMessage={confirmationMessage}
          isConfirmationTyping={confirmationTyping}
        />

        {!sent && sequenceComplete && (
          <MessageInput onSend={handleSend} />
        )}

        {/* Send confirmation overlay */}
        <AnimatePresence>
          {showConfirmation && (
            <SendConfirmation
              key="send-confirm"
              message={pendingMessage}
              onConfirm={handleConfirmSend}
              onCancel={handleConfirmCancel}
            />
          )}
        </AnimatePresence>

        {/* Rating overlay */}
        <AnimatePresence>
          {showRating && (
            <RatingPopup
              key="rating"
              onRate={handleRate}
              onSkip={handleSkipRating}
            />
          )}
        </AnimatePresence>

        {showConfetti && <ConfettiEffect />}
      </div>
    </div>
  );
}
