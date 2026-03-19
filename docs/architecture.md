# Architecture — Talk with the CEO ("Habla con Guille")

## Overview

A miniapp for El Dorado (LATAM fintech superapp) that lets users send messages directly to CEO Guillermo. Built as a WhatsApp-style conversational experience — not a form. The system includes a user-facing chat, an admin dashboard for the CEO, AI-powered message classification, and automated support ticket creation.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                   React 19 + Vite 7                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  User Chat   │  │ Admin Panel  │  │   Zustand Store  │  │
│  │  (App.tsx)   │  │  (/admin)    │  │   (store.ts)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │
│         │                 │                                 │
│  ┌──────┴───────┐  ┌──────┴───────┐                        │
│  │  client.ts   │  │admin-client  │                        │
│  │  (User API)  │  │  (Admin API) │                        │
│  └──────┬───────┘  └──────┬───────┘                        │
└─────────┼─────────────────┼─────────────────────────────────┘
          │  HTTP/JSON      │  HTTP/JSON + JWT
          ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│               Node.js + Express 5 + TypeScript              │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Routes Layer                        │ │
│  │  /api/users  /api/conversations  /api/admin/*          │ │
│  └────────┬──────────┬──────────────────┬─────────────────┘ │
│           │          │                  │                    │
│  ┌────────┴──────────┴──────────────────┴─────────────────┐ │
│  │                  Services Layer                        │ │
│  │  response    analysis    email    redash   engagement  │ │
│  │  .service    .service    .service .service .service    │ │
│  └────────┬──────────┬──────────┬───────────┬─────────────┘ │
│           │          │          │           │                │
│           ▼          ▼          ▼           ▼                │
│     ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────────┐      │
│     │PostgreSQL│ │ OpenAI │ │ Resend │ │   Redash   │      │
│     │  (pg)    │ │  API   │ │  API   │ │   API      │      │
│     └──────────┘ └────────┘ └────────┘ └────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, TypeScript 5.9, Vite 7 | SPA with chat UI |
| Styling | Tailwind CSS 4 | Utility-first CSS with custom theme tokens |
| Animations | Framer Motion 12 | Spring animations for chat bubbles |
| State | Zustand 5 | Lightweight global state management |
| Backend | Node.js, Express 5, TypeScript 5.9 | REST API server |
| Database | PostgreSQL (pg 8.13) | Persistent storage with connection pooling |
| AI | OpenAI gpt-4o-mini | Message classification (category, sentiment, importance) |
| Email | Resend API | Transactional emails (support tickets + confirmations) |
| Analytics | Redash (Query 1464) | User metrics enrichment (volume, transactions, ranks) |
| Auth | JWT (jsonwebtoken 9.0) | Admin dashboard authentication |
| Deploy | Railway | Monorepo deployment with managed PostgreSQL |

## Entity Relationship Diagram (ERD)

```
┌──────────────────────────────────┐
│              users               │
├──────────────────────────────────┤
│ id             UUID PK           │
│ external_id    TEXT UNIQUE       │──── username (MVP) or host app userId
│ email          TEXT nullable     │
│ first_name     TEXT nullable     │
│ vol_total      NUMERIC           │──┐
│ vol_30d        NUMERIC           │  │
│ tx_total       INTEGER           │  ├── Redash metrics
│ tx_30d         INTEGER           │  │
│ rank_vol_total TEXT              │  │
│ rank_vol_30d   TEXT              │  │
│ rank_tx_total  TEXT              │  │
│ rank_tx_30d    TEXT              │──┘
│ engagement_flow TEXT             │──── 'vip' | 'inactive' | 'warmup' | 'regular'
│ metrics_updated_at TIMESTAMPTZ  │
│ created_at     TIMESTAMPTZ      │
│ updated_at     TIMESTAMPTZ      │
└──────────────┬───────────────────┘
               │
               │ 1:N
               ▼
┌──────────────────────────────────┐
│          conversations           │
├──────────────────────────────────┤
│ id             UUID PK           │
│ user_id        UUID FK ──────────│──→ users.id
│ rating         INT nullable      │──── 0-5 (user can skip)
│ status         ENUM              │──── 'active' | 'closed' | 'ticket_opened'
│ ai_category    TEXT nullable     │──── 'elogio'|'sugerencia'|'reclamo'|'duda'|'bug'|'otro'
│ ai_importance  INTEGER nullable  │──── 1-5
│ ai_sentiment   TEXT nullable     │──── 'positivo' | 'neutro' | 'negativo'
│ ai_summary     TEXT nullable     │──── AI-generated one-line summary
│ is_favorited   BOOLEAN           │──── default false, toggled by admin
│ created_at     TIMESTAMPTZ      │
│ updated_at     TIMESTAMPTZ      │
└──────┬───────────────┬───────────┘
       │               │
       │ 1:N           │ 1:N
       ▼               ▼
┌──────────────┐ ┌──────────────────┐
│   messages   │ │    ceo_notes     │
├──────────────┤ ├──────────────────┤
│ id      UUID │ │ id      UUID PK  │
│ conv_id UUID │ │ conv_id UUID FK  │──→ conversations.id
│ sender  ENUM │ │ text    TEXT     │
│ text    TEXT │ │ created_at       │
│ metadata     │ │    TIMESTAMPTZ   │
│   JSONB null │ └──────────────────┘
│ created_at   │
│  TIMESTAMPTZ │
└──────────────┘

sender ENUM: 'user' | 'ceo' | 'system'

metadata JSONB examples:
  User message:  { "mood": "positive", "analysis": { "category": "elogio", ... } }
  Admin reply:   { "source": "admin" }
```

### Database Indexes

| Index | Table | Column(s) | Type |
|-------|-------|-----------|------|
| `idx_conversations_user_id` | conversations | user_id | B-tree |
| `idx_messages_conversation_id` | messages | conversation_id | B-tree |
| `idx_ceo_notes_conversation_id` | ceo_notes | conversation_id | B-tree |
| `idx_conversations_ai_category` | conversations | ai_category | B-tree |
| `idx_conversations_ai_importance` | conversations | ai_importance | B-tree |
| `idx_conversations_favorited` | conversations | is_favorited | Partial (WHERE true) |

## API Reference

### Public Endpoints (User-Facing)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/users` | Create/identify user + Redash enrichment |
| `POST` | `/api/conversations` | Start a new conversation |
| `GET` | `/api/conversations/:id/messages` | Fetch messages (supports `?after=` for polling) |
| `POST` | `/api/conversations/:id/messages` | Send message (triggers AI analysis + complaint detection) |
| `POST` | `/api/conversations/:id/ticket` | Create support ticket (sends emails via Resend) |
| `PATCH` | `/api/conversations/:id/rating` | Submit 0-5 star rating |

### Admin Endpoints (JWT Protected)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/admin/login` | Password login → JWT (24h expiry) |
| `GET` | `/api/admin/conversations` | List conversations with filters and response_status CTE |
| `GET` | `/api/admin/conversations/:id/messages` | Get full message thread |
| `POST` | `/api/admin/conversations/:id/reply` | CEO sends reply (metadata: `{source: "admin"}`) |
| `PATCH` | `/api/admin/conversations/:id/favorite` | Toggle favorite flag |
| `GET` | `/api/admin/conversations/:id/notes` | Get CEO private notes |
| `POST` | `/api/admin/conversations/:id/notes` | Add CEO private note |

### Admin Conversation Filters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `active`, `closed`, `ticket_opened` |
| `rating_min` / `rating_max` | int | Rating range filter |
| `category` | string | AI category: `elogio`, `sugerencia`, `reclamo`, `duda`, `bug`, `otro` |
| `importance_min` | int | Minimum AI importance (1-5) |
| `sentiment` | string | `positivo`, `neutro`, `negativo` |
| `favorited` | boolean | Only show favorited conversations |
| `response_status` | string | Derived: `respondida`, `con_comentario`, `pendiente`, `sin_comentario` |
| `limit` / `offset` | int | Pagination (default: 50/0) |

## Core Flows

### 1. New User Message Flow

```
User opens miniapp
    │
    ├─ First visit? → SplashScreen (2.2s)
    │
    ├─ Not identified? → UsernamePopup
    │       │
    │       ▼
    │   POST /api/users {external_id}
    │       │
    │       ├─ Create/fetch user in PostgreSQL
    │       ├─ Call Redash Query 1464 (10s timeout)
    │       ├─ Persist metrics to users table
    │       ├─ Classify engagement (vip/inactive/warmup/regular)
    │       └─ Return user + engagement data
    │
    ├─ 2s delay (allows Redash enrichment)
    │
    ├─ Chat sequence (4 bubbles with typing indicators):
    │   1. CEO greeting: "¡Hola {Name}..."
    │   2. CEO video (play/pause)
    │   3. Personalized engagement message (based on Redash data)
    │   4. CEO final: "Quiero escucharte personalmente..."
    │
    ├─ User writes message → SendConfirmation ("Are you sure?")
    │
    ▼
POST /api/conversations → conversation_id
POST /api/conversations/:id/messages {text, metadata: {mood}}
    │
    ├─ INSERT user message
    ├─ Fire-and-forget: analyzeMessage() → OpenAI gpt-4o-mini
    │       └─ Classifies: category, importance (1-5), sentiment, summary
    │       └─ Stores in messages.metadata + conversations.ai_* columns
    ├─ Sync: generateResponse() → keyword-based complaint detection
    ├─ INSERT CEO auto-response
    │
    ▼
Return {userMessage, ceoResponse, complaintDetected}
    │
    ├─ complaintDetected = false:
    │       └─ 3s delay → RatingPopup (1-5 stars) → ConfettiEffect
    │
    └─ complaintDetected = true:
            └─ 3s delay → Sí/No buttons (inline, replaces input)
                    │
                    ├─ "Sí, por favor":
                    │       POST /api/conversations/:id/ticket
                    │       ├─ Email to soporte@eldorado.io
                    │       ├─ Email to user (confirmation)
                    │       ├─ Status → 'ticket_opened'
                    │       └─ CEO: "Ya hablé con soporte..."
                    │       → RatingPopup → Confetti
                    │
                    └─ "No, está bien":
                            └─ CEO: "Listo, ya lo recibí..."
                            → RatingPopup → Confetti
```

### 2. Returning User Flow

```
User reopens miniapp (localStorage has conversation-id)
    │
    ├─ Skip splash + greeting sequence
    │
    ├─ GET /api/conversations/:id/messages
    │       └─ Render all messages chronologically
    │
    ├─ Last message from user? → Input locked (awaiting CEO reply)
    ├─ Last message from CEO? → Input unlocked for follow-up
    │
    └─ Polling active: GET /messages?after=<timestamp> every 5s
            └─ Filters: metadata.source === "admin" only
            └─ New CEO reply → play sound + unlock input
```

### 3. Admin CEO Reply Flow

```
Admin opens /admin → AdminLogin → JWT stored in sessionStorage
    │
    ▼
AdminDashboard: GET /api/admin/conversations
    │
    ├─ Table: ★ | User | Category | Importance | Sentiment | Status | Date
    ├─ Sortable columns (client-side)
    ├─ Filters: status, category, importance, sentiment, favorited, response_status
    │
    ▼
Click conversation → ConversationDetail
    │
    ├─ GET /api/admin/conversations/:id/messages
    ├─ Full message thread displayed
    │
    ├─ CEO types reply → POST /api/admin/conversations/:id/reply
    │       ├─ INSERT message with metadata: {source: "admin"}
    │       ├─ Status → 'active', updated_at → NOW()
    │       └─ User's polling picks up the reply within 5s
    │
    ├─ CEO adds private note → POST /api/admin/conversations/:id/notes
    │
    └─ Toggle favorite → PATCH /api/admin/conversations/:id/favorite
```

### 4. AI Message Analysis Flow

```
User message received (POST /api/conversations/:id/messages)
    │
    ▼
analyzeMessage(messageId, text) — fire-and-forget
    │
    ├─ Skip if OPENAI_API_KEY not configured
    │
    ├─ Call OpenAI gpt-4o-mini:
    │   System prompt: classify into {category, importance, sentiment, summary}
    │   Temperature: 0.3 | Max tokens: 200
    │
    ├─ Parse + sanitize JSON response:
    │   category ∈ {elogio, sugerencia, reclamo, duda, bug, otro}
    │   importance ∈ [1-5]
    │   sentiment ∈ {positivo, neutro, negativo}
    │   summary: max 500 chars
    │
    ├─ UPDATE messages SET metadata.analysis = {...}
    │
    └─ UPDATE conversations SET ai_category, ai_importance, ai_sentiment, ai_summary
        └─ Denormalized for fast admin dashboard queries
```

### 5. Redash User Enrichment Flow

```
POST /api/users {external_id}
    │
    ├─ INSERT or SELECT user from PostgreSQL
    │
    ├─ Call Redash Query 1464 (parameter: user=external_id)
    │   Timeout: 10s | Graceful fallback on failure
    │
    │   Returns:
    │   ├─ email, firstName
    │   ├─ vol_total, vol_30d (transaction volume USD)
    │   ├─ tx_total, tx_30d (transaction count)
    │   └─ rank_vol_total, rank_vol_30d, rank_tx_total, rank_tx_30d
    │       (e.g. "Top 1%", "Top 5%", "Iniciante")
    │
    ├─ Classify engagement:
    │   ├─ VIP: rank_vol or rank_tx in Top 1-10%
    │   ├─ Inactive: tx_total === 0
    │   ├─ Warmup: tx_total 1-3
    │   └─ Regular: tx_total > 3
    │
    ├─ UPDATE users: all metrics + engagement_flow + metrics_updated_at
    │
    └─ Return {user, engagement} to frontend
        └─ engagement.message → personalized 3rd CEO bubble
```

## External Integrations

### OpenAI (gpt-4o-mini)

- **Purpose**: Classify user messages (category, importance, sentiment, summary)
- **Trigger**: Fire-and-forget on every user message
- **Config**: `OPENAI_API_KEY` env var
- **Fallback**: Gracefully skipped if not configured
- **Cost**: ~$0.0001 per message (gpt-4o-mini pricing)

### Resend (Email API)

- **Purpose**: Transactional emails for support tickets
- **Sends**: 2 emails per ticket (support team + user confirmation)
- **Config**: `RESEND_API_KEY`, `EMAIL_FROM` env vars
- **Current sender**: `onboarding@resend.dev` (test domain)
- **Production**: Requires domain verification for `@eldorado.io`
- **Fallback**: Gracefully skipped if not configured

### Redash (Analytics)

- **Purpose**: Enrich user data with transaction metrics and rankings
- **Query**: #1464 with `user` parameter
- **Config**: `REDASH_BASE_URL`, `REDASH_API_KEY`, `REDASH_USER_QUERY_ID`
- **Timeout**: 10 seconds
- **Fallback**: User creation succeeds without metrics (engagement = null)

## Deployment

```
┌──────────────────────────────────────────────────┐
│                  Railway                          │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │         talk_with_ceo (service)            │  │
│  │                                            │  │
│  │  Build: npm run build                      │  │
│  │    ├─ cd app && npm install && npm run build│  │
│  │    └─ cd api && npm run build              │  │
│  │                                            │  │
│  │  Run: cd api && node dist/index.js         │  │
│  │    └─ Express serves app/dist/ as static   │  │
│  │    └─ SPA fallback for client-side routing │  │
│  └────────────────┬───────────────────────────┘  │
│                   │                              │
│  ┌────────────────▼───────────────────────────┐  │
│  │    PostgreSQL (managed, auto-SSL)          │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `ADMIN_PASSWORD` | Yes | — | Admin dashboard login password |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `PORT` | No | 3001 | Server port |
| `CORS_ORIGIN` | No | `*` | CORS allowed origin |
| `REDASH_BASE_URL` | No | `https://reports.eldorado.io` | Redash instance URL |
| `REDASH_API_KEY` | For Redash | — | Redash API key |
| `REDASH_USER_QUERY_ID` | No | 1464 | Redash query ID |
| `RESEND_API_KEY` | For emails | — | Resend API key |
| `EMAIL_FROM` | No | `Guillermo - El Dorado <onboarding@resend.dev>` | Email sender |
| `OPENAI_API_KEY` | For AI | — | OpenAI API key (gpt-4o-mini) |

## Frontend Architecture

### Routing

- `/` — User chat (App.tsx)
- `/admin` — Admin dashboard (AdminApp.tsx)
- Route detection via `window.location.pathname` in `main.tsx`

### State Management (Zustand)

```typescript
{
  state: AppState        // 'splash' | 'conversation' | 'composing' | 'sent' | 'confirmed'
  mood: MoodType         // 'idea' | 'positive' | 'frustrated' | 'talk' | null
  messages: Message[]    // Chat message history
  userName: string       // Display name
  userEmail: string      // Optional email
  userId: string         // Backend UUID
  conversationId: string // Current conversation UUID
}
```

### Persistence (localStorage)

| Key | Purpose |
|-----|---------|
| `ceo-chat-conversation-id` | Returning user detection |
| `ceo-chat-user-id` | Backend user UUID |
| `ceo-chat-user-name` | Display name |

### Admin Mock Mode

Password `123` activates offline mock data (5 sample conversations with all fields). Useful for frontend development without backend. Controlled by `sessionStorage('admin_mock')`.

## Design Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-primary` | `#0A0A0A` | Main background |
| `--color-bg-surface` | `#1A1A1A` | Bubbles, inputs |
| `--color-accent-primary` | `#FFFF00` | Send button, accents, user bubbles |
| `--color-text-primary` | `#FFFFFF` | Primary text |
| `--color-text-secondary` | `#999999` | Timestamps |
| `--color-online-green` | `#00D26A` | Online indicator dot |
