ALTER TABLE conversations ADD COLUMN IF NOT EXISTS ai_category   TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS ai_importance INTEGER;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS ai_sentiment  TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS ai_summary    TEXT;

CREATE INDEX IF NOT EXISTS idx_conversations_ai_category ON conversations(ai_category);
CREATE INDEX IF NOT EXISTS idx_conversations_ai_importance ON conversations(ai_importance);
