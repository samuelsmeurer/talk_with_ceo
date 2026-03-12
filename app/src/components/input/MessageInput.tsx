import { useState, useCallback } from 'react';
import { useAutoResize } from '../../hooks/useAutoResize';
import { SendButton } from './SendButton';

interface MessageInputProps {
  onSend: (text: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const { textareaRef, resize } = useAutoResize(150);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, onSend, textareaRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 border-t border-border-default/50 bg-bg-primary" style={{ padding: '12px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              resize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Escribí tu mensaje..."
            rows={1}
            style={{ padding: '12px 20px', fontSize: 15 }}
            className="w-full resize-none bg-bg-surface text-text-primary placeholder-text-muted leading-relaxed rounded-3xl outline-none border border-border-default focus:border-border-focus transition-colors"
          />
        </div>
        <SendButton disabled={!text.trim()} onClick={handleSend} />
      </div>
    </div>
  );
}
