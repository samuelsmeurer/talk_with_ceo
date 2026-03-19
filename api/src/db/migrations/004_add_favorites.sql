-- Add favorites support to conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_favorited BOOLEAN DEFAULT false;

-- Partial index for quick favorite lookups
CREATE INDEX IF NOT EXISTS idx_conversations_favorited ON conversations(is_favorited) WHERE is_favorited = true;
