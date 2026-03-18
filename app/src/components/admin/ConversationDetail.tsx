import { useState, useEffect, useRef } from 'react';
import { getMessages, getNotes, addNote, sendReply } from '../../api/admin-client';
import type { AdminConversation, AdminMessage, CeoNote } from '../../types';

interface ConversationDetailProps {
  conversation: AdminConversation;
  onBack: () => void;
}

export function ConversationDetail({ conversation, onBack }: ConversationDetailProps) {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [notes, setNotes] = useState<CeoNote[]>([]);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMessages(conversation.id),
      getNotes(conversation.id),
    ]).then(([msgs, nts]) => {
      setMessages(msgs);
      setNotes(nts);
    }).finally(() => setLoading(false));
  }, [conversation.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      const msg = await sendReply(conversation.id, replyText.trim());
      setMessages((prev) => [...prev, msg]);
      setReplyText('');
    } finally {
      setSendingReply(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const note = await addNote(conversation.id, noteText.trim());
      setNotes((prev) => [...prev, note]);
      setNoteText('');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="mx-auto flex flex-col" style={{ maxWidth: 960, padding: '24px 20px', minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
          <button
            onClick={onBack}
            className="text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            ← Volver
          </button>
          <div className="flex-1">
            <span className="text-sm font-medium text-text-primary">{conversation.external_id}</span>
            <span className="text-xs text-text-muted" style={{ marginLeft: 8 }}>
              {formatDate(conversation.created_at)}
            </span>
          </div>
          {conversation.rating !== null && (
            <span className="text-sm text-text-secondary">
              {'★'.repeat(conversation.rating)}{'☆'.repeat(5 - conversation.rating)}
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-text-secondary text-sm">Cargando...</p>
        ) : (
          <div className="flex gap-5 flex-1" style={{ minHeight: 0 }}>
            {/* Messages */}
            <div className="flex-1 flex flex-col rounded-xl overflow-hidden" style={{ backgroundColor: '#111111', border: '1px solid #333333' }}>
              <div className="text-xs font-medium text-text-secondary" style={{ padding: '10px 16px', borderBottom: '1px solid #333333' }}>
                Mensajes ({messages.length})
              </div>
              <div className="flex-1 overflow-y-auto" style={{ padding: 16 }}>
                <div className="flex flex-col gap-3">
                  {messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={msg.id} className={`flex ${isUser ? 'justify-end' : ''}`}>
                        <div
                          className="rounded-2xl"
                          style={{
                            maxWidth: '75%',
                            padding: '10px 14px',
                            fontSize: 13,
                            lineHeight: 1.5,
                            backgroundColor: isUser ? '#FFFF00' : '#1f1f1f',
                            color: isUser ? '#0a0a0a' : '#ffffff',
                            border: isUser ? 'none' : '1px solid rgba(60,60,60,0.6)',
                          }}
                        >
                          <p>{msg.text}</p>
                          <p className="text-right" style={{ fontSize: 10, marginTop: 4, opacity: 0.5 }}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <form onSubmit={handleSendReply} className="flex gap-2" style={{ padding: 12, borderTop: '1px solid #333333' }}>
                <input
                  type="text"
                  placeholder="Responder como Guille..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 rounded-lg text-text-primary placeholder-text-muted outline-none text-sm"
                  style={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #333333',
                    padding: '8px 12px',
                    fontSize: 13,
                  }}
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sendingReply}
                  className="rounded-lg font-medium text-sm transition-opacity disabled:opacity-40"
                  style={{
                    backgroundColor: '#FFFF00',
                    color: '#0A0A0A',
                    padding: '8px 14px',
                    fontSize: 13,
                  }}
                >
                  Enviar
                </button>
              </form>
            </div>

            {/* Notes sidebar */}
            <div className="flex flex-col rounded-xl overflow-hidden" style={{ width: 300, backgroundColor: '#111111', border: '1px solid #333333' }}>
              <div className="text-xs font-medium text-text-secondary" style={{ padding: '10px 16px', borderBottom: '1px solid #333333' }}>
                Notas del CEO ({notes.length})
              </div>
              <div className="flex-1 overflow-y-auto" style={{ padding: 12 }}>
                {notes.length === 0 && (
                  <p className="text-xs text-text-muted">Sin notas aún.</p>
                )}
                <div className="flex flex-col gap-2">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg"
                      style={{
                        backgroundColor: '#1A1A1A',
                        padding: '10px 12px',
                        fontSize: 13,
                      }}
                    >
                      <p className="text-text-primary" style={{ lineHeight: 1.5 }}>{note.text}</p>
                      <p className="text-text-muted" style={{ fontSize: 10, marginTop: 4 }}>
                        {formatDate(note.created_at)} {formatTime(note.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <form onSubmit={handleAddNote} className="flex gap-2" style={{ padding: 12, borderTop: '1px solid #333333' }}>
                <input
                  type="text"
                  placeholder="Agregar nota..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 rounded-lg text-text-primary placeholder-text-muted outline-none text-sm"
                  style={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #333333',
                    padding: '8px 12px',
                    fontSize: 13,
                  }}
                />
                <button
                  type="submit"
                  disabled={!noteText.trim() || submitting}
                  className="rounded-lg font-medium text-sm transition-opacity disabled:opacity-40"
                  style={{
                    backgroundColor: '#FFFF00',
                    color: '#0A0A0A',
                    padding: '8px 14px',
                    fontSize: 13,
                  }}
                >
                  +
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
