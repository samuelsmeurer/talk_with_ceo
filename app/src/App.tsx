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
import { useMessagePolling } from './hooks/useMessagePolling';
import { useStore } from './store';
import { playReceived, playSent } from './hooks/useSounds';
import { startConversation, sendMessage, rateConversation, createTicket, persistMessage, getMessages as fetchAllMessages } from './api/client';
import { buildGreetingMessage, DEFAULT_ENGAGEMENT_MESSAGE, CEO_FINAL_MESSAGE, CEO_CONFIRMATION_MESSAGE, TYPING_DELAYS } from './constants';
import type { Message } from './types';
import type { ServerMessage } from './api/client';

const CONVERSATION_STORAGE_KEY = 'ceo-chat-conversation-id';

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
  const [showSupportConfirmation, setShowSupportConfirmation] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [serverMessages, setServerMessages] = useState<Message[]>([]);
  const [pollEnabled, setPollEnabled] = useState(false);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [awaitingCeoReply, setAwaitingCeoReply] = useState(false);

  const conversationIdRef = useRef('');

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

  // Detect returning user — load previous conversation from localStorage
  useEffect(() => {
    const savedConvId = localStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (!savedConvId || !isIdentified) return;

    conversationIdRef.current = savedConvId;
    setConversationId(savedConvId);

    // Fetch all messages from the server
    fetchAllMessages(savedConvId).then((msgs) => {
      const mapped: Message[] = msgs.map((m) => ({
        id: m.id,
        text: m.text,
        sender: m.sender,
        timestamp: m.created_at,
      }));
      if (mapped.length > 0) {
        setServerMessages(mapped);
        setIsReturningUser(true);
        setSent(true);
        setIsFollowUp(true);
        setChatStarted(true);
        setShowSplash(false);
        setPollEnabled(true);
        // If last message is from user, they're awaiting a CEO reply
        const lastMsg = mapped[mapped.length - 1];
        if (lastMsg.sender === 'user') {
          setAwaitingCeoReply(true);
        }
      }
    }).catch(() => {
      // Failed to load — treat as new user, clear stale id
      localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIdentified]);

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

  // Polling: receive CEO admin replies in real-time
  const handleNewPolledMessages = useCallback((msgs: ServerMessage[]) => {
    const newBubbles: Message[] = msgs.map((m) => ({
      id: m.id,
      text: m.text,
      sender: m.sender,
      timestamp: m.created_at,
    }));
    setPostSendMessages((prev) => {
      // Deduplicate by id
      const existingIds = new Set(prev.map((m) => m.id));
      const unique = newBubbles.filter((m) => !existingIds.has(m.id));
      return unique.length > 0 ? [...prev, ...unique] : prev;
    });
    // Also deduplicate against serverMessages
    setServerMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const unique = newBubbles.filter((m) => !existingIds.has(m.id));
      return unique.length > 0 ? [...prev, ...unique] : prev;
    });
    if (newBubbles.length > 0) {
      playReceived();
      // CEO replied — unlock the input so user can respond
      setAwaitingCeoReply(false);
    }
  }, []);

  useMessagePolling(conversationIdRef.current, pollEnabled, handleNewPolledMessages);

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
      if (!isFollowUp && sent) return;
      setPendingMessage(text);
      setShowConfirmation(true);
    },
    [sent, isFollowUp]
  );

  const handleConfirmCancel = useCallback(() => {
    setShowConfirmation(false);
    setPendingMessage('');
  }, []);

  const handleConfirmSend = useCallback(async () => {
    setShowConfirmation(false);
    const text = pendingMessage;
    setPendingMessage('');

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
    };

    // Follow-up: just send the message, no CEO auto-response, no rating
    if (isFollowUp) {
      if (isReturningUser) {
        setServerMessages((prev) => [...prev, userMessage]);
      } else {
        setPostSendMessages((prev) => [...prev, userMessage]);
      }
      playSent();
      // Lock input until CEO replies from admin
      setAwaitingCeoReply(true);

      try {
        if (conversationIdRef.current) {
          await sendMessage(conversationIdRef.current, text, { mood });
        }
      } catch {
        // API failed silently
      }
      return;
    }

    // First message flow: CEO auto-response + complaint detection + rating
    addMessage(userMessage);
    playSent();
    setSent(true);

    let ceoResponseText = CEO_CONFIRMATION_MESSAGE;
    let isComplaint = false;

    try {
      const currentUserId = await awaitRealUserId();
      const conversation = await startConversation(currentUserId);
      conversationIdRef.current = conversation.id;
      setConversationId(conversation.id);
      localStorage.setItem(CONVERSATION_STORAGE_KEY, conversation.id);

      // Persist initial CEO greeting messages so returning users see the full conversation
      if (conversation.isNew) {
        for (const msg of ceoMessages) {
          await persistMessage(conversation.id, 'ceo', msg.text);
        }
      }

      const result = await sendMessage(conversation.id, text, { mood });
      ceoResponseText = result.ceoResponse.text;
      isComplaint = result.complaintDetected;
    } catch {
      // API failed — use hardcoded fallback
    }

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
  }, [pendingMessage, addMessage, mood, awaitRealUserId, setConversationId, isFollowUp, isReturningUser, ceoMessages]);

  const handleSupportYes = useCallback(async () => {
    setShowSupportConfirmation(false);

    // Add user choice as bubble
    setPostSendMessages((prev) => [
      ...prev,
      { id: `user-support-yes-${Date.now()}`, text: 'Sí, por favor', sender: 'user' },
    ]);
    playSent();

    // Persist user choice to DB
    if (conversationIdRef.current) {
      persistMessage(conversationIdRef.current, 'user', 'Sí, por favor').catch(() => {});
    }

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

    // Persist user choice to DB
    if (conversationIdRef.current) {
      persistMessage(conversationIdRef.current, 'user', 'No, está bien').catch(() => {});
    }

    // Show typing then dismiss bubble
    setConfirmationTyping(true);

    setTimeout(() => {
      setConfirmationTyping(false);
      setPostSendMessages((prev) => [
        ...prev,
        { id: 'ceo-dismiss', text: CEO_DISMISS_MESSAGE, sender: 'ceo' },
      ]);

      // Persist CEO dismiss to DB
      if (conversationIdRef.current) {
        persistMessage(conversationIdRef.current, 'ceo', CEO_DISMISS_MESSAGE).catch(() => {});
      }
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
      setTimeout(() => {
        setShowConfetti(false);
        setPollEnabled(true);
        setIsFollowUp(true);
        setAwaitingCeoReply(true);
      }, 2000);
    },
    []
  );

  const handleSkipRating = useCallback(() => {
    setShowRating(false);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setPollEnabled(true);
      setIsFollowUp(true);
      setAwaitingCeoReply(true);
    }, 2000);
  }, []);

  return (
    <div className="h-full w-full flex justify-center items-center overflow-hidden" style={{ backgroundColor: '#050505' }}>
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
          serverMessages={isReturningUser ? serverMessages : undefined}
        />

        {((!sent && sequenceComplete) || (isFollowUp && !awaitingCeoReply && !showRating && !showConfirmation && !showSupportConfirmation && !showConfetti)) && (
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
