CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE conversation_status AS ENUM ('active', 'closed', 'ticket_opened');
CREATE TYPE message_sender AS ENUM ('user', 'ceo', 'system');

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id       TEXT UNIQUE NOT NULL,
  email             TEXT,
  first_name        TEXT,
  vol_total         NUMERIC,
  vol_30d           NUMERIC,
  tx_total          INTEGER,
  tx_30d            INTEGER,
  rank_vol_total    TEXT,
  rank_vol_30d      TEXT,
  rank_tx_total     TEXT,
  rank_tx_30d       TEXT,
  engagement_flow   TEXT,
  metrics_updated_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  rating     INT CHECK (rating >= 0 AND rating <= 5),
  status     conversation_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender          message_sender NOT NULL,
  text            TEXT NOT NULL,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ceo_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  text            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_ceo_notes_conversation_id ON ceo_notes(conversation_id);
