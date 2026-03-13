import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { StatusBar } from './components/layout/StatusBar';
import { ConversationThread } from './components/chat/ConversationThread';
import { MessageInput } from './components/input/MessageInput';
import { ConfettiEffect } from './components/confirmation/ConfettiEffect';
import { SplashScreen } from './components/intro/SplashScreen';
import { UsernamePopup } from './components/intro/UsernamePopup';
import { SendConfirmation } from './components/confirmation/SendConfirmation';
import { SupportConfirmation } from './components/confirmation/SupportConfirmation';
import { RatingPopup } from './components/confirmation/RatingPopup';
import { useTypingSequence } from './hooks/useTypingSequence';
import { useFirstVisit } from './hooks/useFirstVisit';
import { useUserIdentification } from './hooks/useUserIdentification';
import { useStore } from './store';
import { playReceived, playSent } from './hooks/useSounds';
import { startConversation, sendMessage, rateConversation, createTicket } from './api/client';
import { buildGreetingMessage, DEFAULT_ENGAGEMENT_MESSAGE, CEO_FINAL_MESSAGE, CEO_CONFIRMATION_MESSAGE, TYPING_DELAYS } from './constants';
import type { Message } from './types';

const CEO_DISMISS_MESSAGE =
  '¡Listo! Ya lo recibí. Lo voy a leer personalmente. Gracias por tomarte el tiempo. Si tenés algún problema, podés escribirme de nuevo.';

export default function App() {
  const { isFirstVisit, markVisited } = useFirstVisit();
  const { userId, userName, isIdentified, identify, engagement, awaitRealUserId } = useUserIdentification();

  const [showSplash, setShowSplash] = useState(isFirstVisit);
  const [showUsernamePopup, setShowUsernamePopup] = useState(!isIdentified);
  const [chatStarted, setChatStarted] = useState(!isFirstVisit && isIdentified);
  const [sent, setSent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confirmationTyping, setConfirmationTyping] = useState(false);
  const [postSendMessages, setPostSendMessages] = useState<Message[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [complaintDetected, setComplaintDetected] = useState(false);
  const [showSupportConfirmation, setShowSupportConfirmation] = useState(false);

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

  // Build CEO messages: greeting → [video] → engagement → final
  const ceoMessages = useMemo(() => {
    const displayName = engagement?.firstName || userName || '';
    const greeting = buildGreetingMessage(displayName);
    const engagementMsg: Message = engagement?.message
      ? { id: 'ceo-engagement', text: engagement.message, sender: 'ceo' }
      : DEFAULT_ENGAGEMENT_MESSAGE;
    return [greeting, engagementMsg, CEO_FINAL_MESSAGE];
  }, [engagement, userName]);

  // greeting(text) + video + engagement(text) + final(text) = 4 items
  const totalSequenceItems = 4;

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

  // Play sound when a new post-send message arrives
  const prevPostSendCount = useRef(0);
  useEffect(() => {
    if (postSendMessages.length > prevPostSendCount.current) {
      const latest = postSendMessages[postSendMessages.length - 1];
      if (latest.sender === 'ceo') {
        playReceived();
      }
    }
    prevPostSendCount.current = postSendMessages.length;
  }, [postSendMessages]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    markVisited();
    if (isIdentified) {
      setTimeout(() => setChatStarted(true), 2000);
    }
  }, [markVisited, isIdentified]);

  const handleUsernameComplete = useCallback(
    (_userId: string) => {
      setShowUsernamePopup(false);
      if (!showSplash) {
        setTimeout(() => setChatStarted(true), 2000);
      }
    },
    [showSplash]
  );

  // When splash finishes and user is now identified, start chat
  useEffect(() => {
    if (!showSplash && !showUsernamePopup && !chatStarted) {
      setTimeout(() => setChatStarted(true), 2000);
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
    let isComplaint = false;

    try {
      const currentUserId = await awaitRealUserId();
      const conversation = await startConversation(currentUserId);
      conversationIdRef.current = conversation.id;
      setConversationId(conversation.id);

      const result = await sendMessage(conversation.id, text, { mood });
      ceoResponseText = result.ceoResponse.text;
      isComplaint = result.complaintDetected;
    } catch {
      // API failed — use hardcoded fallback
    }

    setComplaintDetected(isComplaint);

    setTimeout(() => {
      setConfirmationTyping(true);
    }, TYPING_DELAYS.confirmationDelay);

    const confirmAt = TYPING_DELAYS.confirmationDelay + TYPING_DELAYS.typingDuration;

    setTimeout(() => {
      setConfirmationTyping(false);
      setPostSendMessages((prev) => [
        ...prev,
        { id: 'ceo-confirm', text: ceoResponseText, sender: 'ceo' },
      ]);
    }, confirmAt);

    setTimeout(() => {
      if (isComplaint) {
        setShowSupportConfirmation(true);
      } else {
        setShowRating(true);
      }
    }, confirmAt + 3000);
  }, [pendingMessage, addMessage, mood, awaitRealUserId, setConversationId]);

  const handleSupportYes = useCallback(async () => {
    setShowSupportConfirmation(false);

    // Add user choice as bubble
    setPostSendMessages((prev) => [
      ...prev,
      { id: `user-support-yes-${Date.now()}`, text: 'Sí, por favor', sender: 'user' },
    ]);
    playSent();

    let ceoText =
      '¡Listo! Ya hablé con el equipo de soporte, se van a comunicar con vos en los próximos minutos.';

    try {
      if (conversationIdRef.current) {
        const result = await createTicket(conversationIdRef.current);
        ceoText = result.ceoResponse.text;
      }
    } catch {
      // Ticket creation failed — use fallback text
    }

    // Show typing then ticket confirmation bubble
    setConfirmationTyping(true);

    setTimeout(() => {
      setConfirmationTyping(false);
      setPostSendMessages((prev) => [
        ...prev,
        { id: 'ceo-ticket-confirm', text: ceoText, sender: 'ceo' },
      ]);
    }, TYPING_DELAYS.typingDuration);

    setTimeout(() => {
      setShowRating(true);
    }, TYPING_DELAYS.typingDuration + 3000);
  }, []);

  const handleSupportNo = useCallback(() => {
    setShowSupportConfirmation(false);

    // Add user choice as bubble
    setPostSendMessages((prev) => [
      ...prev,
      { id: `user-support-no-${Date.now()}`, text: 'No, está bien', sender: 'user' },
    ]);
    playSent();

    // Show typing then dismiss bubble
    setConfirmationTyping(true);

    setTimeout(() => {
      setConfirmationTyping(false);
      setPostSendMessages((prev) => [
        ...prev,
        { id: 'ceo-dismiss', text: CEO_DISMISS_MESSAGE, sender: 'ceo' },
      ]);
    }, TYPING_DELAYS.typingDuration);

    setTimeout(() => {
      setShowRating(true);
    }, TYPING_DELAYS.typingDuration + 3000);
  }, []);

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
          ceoMessages={ceoMessages}
          visibleCount={visibleCount}
          isTyping={isTyping}
          postSendMessages={postSendMessages}
          isConfirmationTyping={confirmationTyping}
        />

        {!sent && sequenceComplete && (
          <MessageInput onSend={handleSend} />
        )}

        {/* Support confirmation inline (complaint flow) */}
        {showSupportConfirmation && (
          <SupportConfirmation
            onYes={handleSupportYes}
            onNo={handleSupportNo}
          />
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
