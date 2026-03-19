# Talk with the CEO — "Habla con Guille"

Miniapp for El Dorado (LATAM fintech superapp) that lets users send messages directly to CEO Guille. The interface simulates a WhatsApp-style chat conversation — not a form, but a conversational experience.

## Stack

### Frontend
- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS 4** with `@tailwindcss/vite` (uses `@theme` directive for tokens)
- **Framer Motion 12** for animations (bubbles, springs, transitions)
- **Zustand 5** for global state management
- **clsx** for class name composition
- **@fontsource/inter** (self-hosted)

### Backend
- **Node.js** + **TypeScript 5.9** + **Express 5**
- **PostgreSQL** (`pg` 8.13) with connection pooling
- **Resend API** (via `fetch`) for transactional emails (support tickets + user confirmations)
- **JWT** (`jsonwebtoken` 9.0) for admin authentication
- **uuid** for ID generation
- **dotenv** for environment config
- **tsx** for development with watch mode

## Commands

```bash
# Frontend
cd app
npm run dev          # Dev server at http://localhost:5173
npm run build        # Production build to dist/
npx tsc --noEmit     # Type check without emitting

# Backend
cd api
npm run dev          # Dev server at http://localhost:3001 (tsx watch)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled dist/index.js

# Monorepo (from root)
npm run build        # Builds both app + api
npm start            # Runs api (serves frontend from app/dist)
```

## Project Structure (Root)

```
talk_with_ceo/
  CLAUDE.md                        # This file — project context for Claude
  package.json                     # Monorepo scripts (build:app, build:api, start)
  Procfile                         # Railway: web: cd api && node dist/index.js
  .gitignore
  app/                             # Frontend (React + Vite)
  api/                             # Backend (Node.js + Express + PostgreSQL)
  assets/                          # El Dorado design library (reference, not used by app)
  docs/                            # Reference documents
    talk-with-ceo-spec.md          # Product spec (hero, inputs, tone of voice)
    forms.csv                      # CEO questionnaire responses
    infos.txt                      # Backend requirements notes (Portuguese)
  inst2.md                         # Redash integration + engagement routing instructions
  User_information_2026_03_12.csv  # Sample user data export (110 rows, reference)
```

## Frontend Architecture

```
app/src/
  main.tsx                           # Entry — renders App or AdminApp based on /admin route
  App.tsx                            # Orchestrator — splash → username → chat → confirm → rating → confetti → follow-up
  store.ts                           # Zustand store (mood, messages, userName, userId, conversationId)
  constants.ts                       # CEO message builders, formatFirstName, delays
  types/index.ts                     # AppState, MoodType, Message + Admin types (ResponseStatus, SortField, SortDirection)
  index.css                          # Tailwind @theme tokens + keyframes + scrollbar
  api/
    client.ts                        # User-facing API (users, conversations, messages, rating, tickets) + getMessages polling
    admin-client.ts                  # Admin API + mock mode (password '123' = offline mock data) + sendReply + toggleFavorite
  components/
    chat/
      ConversationThread.tsx         # Scrollable area — greeting + video + engagement + final + typing
      ChatBubble.tsx                 # Individual bubble (CEO=dark, user=yellow)
      VideoBubble.tsx                # Inline CEO video with play/pause
      AvatarCircle.tsx               # Circular avatar + online dot
      TypingIndicator.tsx            # 3 animated dots
      ChatWallpaper.tsx              # Decorative background with product assets
    input/
      MessageInput.tsx               # Auto-grow textarea + send button
      SendButton.tsx                 # Yellow circular button
      SendConfirmation.tsx           # "Are you sure?" overlay before sending
    layout/
      StatusBar.tsx                  # Top bar — "Guille" + online dot + logo
      RatingPopup.tsx                # 1-5 star rating after message sent (can skip)
    intro/
      SplashScreen.tsx               # Initial screen with logo + progress bar
      UsernamePopup.tsx              # First-visit username identification popup
      FloatingAssets.tsx             # Floating assets (used in splash)
    admin/
      AdminApp.tsx                   # Admin shell — login state → dashboard or detail
      AdminLogin.tsx                 # Password login form
      AdminDashboard.tsx             # Tabular view with sortable columns, filters, favorites
      ConversationDetail.tsx         # Single conversation view + CEO reply input + CEO notes
    confirmation/
      ConfettiEffect.tsx             # Yellow confetti canvas
      SupportConfirmation.tsx        # Inline Sí/No buttons (complaint flow, replaces input bar)
    mood/
      MoodSelector.tsx               # Horizontal pill container (NOT INTEGRATED)
      MoodPill.tsx                   # Individual pill with color (NOT INTEGRATED)
    decoration/
      ProductStrip.tsx               # Horizontal product marquee (NOT INTEGRATED)
      FloatingAssets.tsx             # Floating assets for desktop (NOT INTEGRATED)
  hooks/
    useTypingSequence.ts             # Controls sequential bubble timing (4-item sequence)
    useSounds.ts                     # Plays received/sent sounds (30% volume)
    useAutoResize.ts                 # Textarea auto-grow (max 150px)
    useFirstVisit.ts                 # sessionStorage — splash only on first visit
    useUserIdentification.ts         # localStorage + POST /api/users + engagement data
    useMessagePolling.ts             # Polls GET /messages?after= every 5s for admin CEO replies
```

## App Flow (Current Implementation)

### New User Flow
```
1.  User opens miniapp
2.  If first visit → SplashScreen (logo + progress bar, 2.2s)
3.  If not identified → UsernamePopup → POST /api/users → localStorage
    └─ Backend fetches Redash metrics → persists all to DB → returns engagement
4.  2-second delay before chat starts (allows Redash enrichment to complete)
5.  Chat screen: StatusBar + ConversationThread (4-item sequence with typing indicators)
    a. CEO greeting text: "¡Hola {Name}, ¿todo bien? Acá Guillermo..."
       └─ Name: first word only, title case (JESUS ANDRES → Jesus)
    b. VideoBubble (CEO video with play/pause)
    c. CEO engagement text (personalized by Redash data or default)
    d. CEO final text: "Quiero escucharte personalmente, contame lo que quieras."
    e. Sound effect on each bubble arrival (except first)
6.  MessageInput appears after sequence completes
7.  User writes message → taps send
8.  SendConfirmation popup: "Are you sure?" → "Yes" / "Modify"
9.  On confirm:
    a. POST /api/conversations → conversation_id (saved to localStorage)
    b. POST /api/conversations/:id/messages {text, metadata: {mood}}
    c. User bubble appears in chat
    d. CEO typing indicator (600ms)
    e. CEO response bubble (complaint or standard confirmation)
10. If NO complaint detected (standard flow):
    a. 3-second delay → RatingPopup → ConfettiEffect
11. If complaint detected:
    a. 3-second delay → inline Sí/No buttons replace input bar
    b. "Sí, por favor" → user bubble + POST /api/conversations/:id/ticket
       (sends 2 emails via Resend: support ticket + user confirmation)
       → CEO typing → CEO "ya hablé con soporte" → rating → confetti
    c. "No, está bien" → user bubble → CEO typing
       → CEO "Listo, ya lo recibí..." → rating → confetti
    d. All messages persist as bubbles in postSendMessages array
12. RatingPopup: 1-5 stars or skip → PATCH /api/conversations/:id/rating
13. ConfettiEffect → enables polling + follow-up mode
```

### Returning User Flow
```
1.  User reopens miniapp (localStorage has ceo-chat-conversation-id)
2.  Skips splash + greeting sequence entirely
3.  Fetches all messages: GET /api/conversations/:id/messages
4.  ConversationThread renders in "returning" mode — all messages chronologically
5.  If last message is from user → input locked (awaitingCeoReply = true)
6.  If last message is from CEO → MessageInput shown for follow-up
7.  Polling active: useMessagePolling checks every 5s for admin CEO replies
    └─ Filters only messages with metadata.source === "admin"
    └─ Plays received sound + unlocks input on new CEO message
```

### Follow-Up Message Flow (after rating/confetti)
```
1.  After confetti ends → isFollowUp = true, polling enabled
2.  MessageInput reappears — user can send additional messages
3.  Follow-up messages: no CEO auto-response, no rating popup
4.  Message sent → input locks (awaitingCeoReply = true)
5.  Polls for admin CEO reply → unlocks input when received
```

### Message Flow Details (`constants.ts`)

- `formatFirstName(name)` — extracts first word, title case (e.g. "PAOLA ANDREA" → "Paola")
- `buildGreetingMessage(name)` — builds greeting Message with formatted name
- `DEFAULT_ENGAGEMENT_MESSAGE` — fallback when Redash data unavailable
- `CEO_FINAL_MESSAGE` — static final bubble

The 3 CEO text messages are built dynamically in `App.tsx` via `useMemo`:
1. Greeting (from `buildGreetingMessage` using engagement.firstName or userName)
2. Engagement (from `engagement.message` or `DEFAULT_ENGAGEMENT_MESSAGE`)
3. Final (static `CEO_FINAL_MESSAGE`)

`ConversationThread.tsx` has two rendering modes:
- **New user**: renders in fixed order text[0] → video → text[1] → text[2], controlled by `visibleCount` (1-4)
- **Returning user** (`serverMessages` prop): renders all server messages chronologically, no greeting/video sequence

## Backend Architecture

```
api/src/
  index.ts                           # Express app + SPA static file serving + graceful shutdown
  config.ts                          # Env vars with validation (throws on missing required)
  db/
    client.ts                        # pg.Pool with SSL auto-detection
    schema.sql                       # Full DDL (4 tables, 2 enums, 3 indexes)
    migrations/
      001_add_first_name.sql         # Adds first_name column to users
      002_add_user_metrics.sql       # Adds Redash metrics + engagement columns to users
      003_add_ai_analysis.sql        # Adds AI analysis columns to conversations
      004_add_favorites.sql          # Adds is_favorited boolean + partial index to conversations
  routes/
    users.ts                         # POST /api/users (create + Redash enrichment + persist metrics)
    conversations.ts                 # POST /api/conversations + POST /:id/ticket (emails + status)
    messages.ts                      # GET + POST /api/conversations/:id/messages (+ complaint detection + polling)
    rating.ts                        # PATCH /api/conversations/:id/rating
    admin.ts                         # Login + list + messages + notes + reply (JWT protected)
  services/
    response.service.ts              # CEO response + complaint keyword detection
    email.service.ts                 # Resend API: support ticket + user confirmation emails
    redash.service.ts                # Redash Query 1464 execution (10s timeout, graceful fallback)
    engagement.service.ts            # User engagement classification + personalized messages
  middleware/
    admin-auth.ts                    # JWT verification for admin routes
  types/
    redash.ts                        # TypeScript interfaces for Redash data + rank constants
```

### Database Schema (PostgreSQL)

```
users
  id                UUID PK
  external_id       TEXT UNIQUE    ← username (MVP) or userId from host app (future)
  email             TEXT nullable  ← enriched from Redash
  first_name        TEXT nullable  ← enriched from Redash
  vol_total         NUMERIC        ← total transaction volume (USD)
  vol_30d           NUMERIC        ← 30-day transaction volume (USD)
  tx_total          INTEGER        ← total transaction count
  tx_30d            INTEGER        ← 30-day transaction count
  rank_vol_total    TEXT           ← e.g. "Top 5%", "Iniciante"
  rank_vol_30d      TEXT           ← 30-day volume rank
  rank_tx_total     TEXT           ← total transaction rank
  rank_tx_30d       TEXT           ← 30-day transaction rank
  engagement_flow   TEXT           ← 'vip' | 'inactive' | 'warmup' | 'regular'
  metrics_updated_at TIMESTAMPTZ   ← last Redash enrichment timestamp
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ

conversations
  id              UUID PK
  user_id         UUID FK → users
  rating          INT nullable   ← 0-5, user can skip
  status          ENUM           ← 'active' | 'closed' | 'ticket_opened'
  ai_category     TEXT nullable   ← 'elogio' | 'sugerencia' | 'reclamo' | 'duda' | 'bug' | 'otro'
  ai_importance   INTEGER nullable ← 1-5
  ai_sentiment    TEXT nullable   ← 'positivo' | 'neutro' | 'negativo'
  ai_summary      TEXT nullable   ← AI-generated one-line summary
  is_favorited    BOOLEAN         ← default false, toggled by admin
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

messages
  id              UUID PK
  conversation_id UUID FK → conversations
  sender          ENUM           ← 'user' | 'ceo' | 'system'
  text            TEXT
  metadata        JSONB nullable ← mood, ai_model, tokens_used, etc.
  created_at      TIMESTAMPTZ

ceo_notes
  id              UUID PK
  conversation_id UUID FK → conversations
  text            TEXT
  created_at      TIMESTAMPTZ
```

### API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/health` | — | Health check |
| `POST` | `/api/users` | — | Create/identify user + Redash enrichment + persist metrics + engagement |
| `POST` | `/api/conversations` | — | Start conversation |
| `GET` | `/api/conversations/:id/messages` | — | Fetch messages (supports `?after=` for incremental polling) |
| `POST` | `/api/conversations/:id/messages` | — | Send message (+ complaint detection + CEO response) |
| `POST` | `/api/conversations/:id/ticket` | — | Create support ticket (sends emails via Resend, sets status) |
| `PATCH` | `/api/conversations/:id/rating` | — | Submit 0-5 rating |
| `POST` | `/api/admin/login` | — | Password → JWT (24h expiry) |
| `GET` | `/api/admin/conversations` | JWT | List conversations (filters: status, rating_min/max, category, importance_min, sentiment, favorited, response_status, limit, offset) |
| `GET` | `/api/admin/conversations/:id/messages` | JWT | Get conversation messages |
| `POST` | `/api/admin/conversations/:id/reply` | JWT | CEO sends reply to user (metadata: `{source: "admin"}`) |
| `PATCH` | `/api/admin/conversations/:id/favorite` | JWT | Toggle `is_favorited` boolean |
| `GET` | `/api/admin/conversations/:id/notes` | JWT | Get CEO notes |
| `POST` | `/api/admin/conversations/:id/notes` | JWT | Add CEO note |

### Redash Integration

The backend enriches user data via El Dorado's Redash analytics platform on every `POST /api/users` call. All metrics are persisted to the `users` table (overwritten on each call).

**Flow:**
```
POST /api/users {external_id} →
  1. Create/fetch user in PostgreSQL
  2. Call Redash Query 1464 with user={external_id}
  3. Redash returns: email, firstName, vol_total, vol_30d, tx_total, tx_30d,
     rank_vol_total, rank_vol_30d, rank_tx_total, rank_tx_30d
  4. Classify engagement level (vip/inactive/warmup/regular)
  5. UPDATE user: email, first_name, all 8 metrics, engagement_flow, metrics_updated_at
  6. Return user + engagement data to frontend
```

**Redash Query 1464 columns** (all ranks are **strings**, not numbers):

| Column | Type | Example |
|--------|------|---------|
| firstName | string | "SSM" |
| email | string | "s.schramm@eldorado.io" |
| vol_total | float | 11269.53 |
| vol_30d | float | 11.07 |
| tx_total | int | 37 |
| tx_30d | int | 1 |
| rank_vol_total | string | "Top 5%" |
| rank_vol_30d | string | "Iniciante" |
| rank_tx_total | string | "Top 5%" |
| rank_tx_30d | string | "Iniciante" |

Rank values returned by Redash: `"Top 1%"`, `"Top 2%"`, `"Top 3%"`, `"Top 5%"`, `"Top 10%"`, `"Top 15%"`, `"Top 20%"`, `"Top 25%"`, `"Top 30%"`, `"Iniciante"`

### Engagement Classification (`engagement.service.ts`)

| Flow | Condition | Personalized Message (3rd bubble) |
|------|-----------|----------------------------------|
| **VIP** | rank_vol_total or rank_tx_total is Top 1-10% | "Estoy muy contento de hablar con vos, más aún porque estás entre el {bestRank} de usuarios de El Dorado en {context}..." |
| **Inactive** | tx_total === 0 | "Estoy muy contento de hablar con vos. Vi que todavía no hiciste tu primera transacción, me encantaría ayudarte a arrancar." |
| **Warmup** | tx_total 1-3 | "Estoy muy contento de hablar con vos, más aún porque ya hiciste {N} transacciones en El Dorado..." |
| **Regular** | tx_total > 3 | "Estoy muy contento de hablar con vos. Me importa mucho tu punto de vista." |

**Key helpers:**
- `VIP_RANKS`: `['Top 1%', 'Top 2%', 'Top 3%', 'Top 5%', 'Top 10%']`
- `RANK_ORDER`: all ranks from most exclusive to least (used by `getBestRank`)
- `getBestRank(rankA, rankB)`: returns the more exclusive of two ranks
- `formatName(name)`: first word, title case (backend side)
- VIP context: "volumen y transacciones" (both), "volumen de transacciones" (vol only), "cantidad de transacciones" (tx only)
- Non-blocking: if Redash fails, user creation still succeeds (engagement = null)
- 10-second timeout on Redash queries
- Redash API parameter is `user` (not `p_user`)

### CEO Response + Complaint Detection (`response.service.ts`)

`generateResponse(conversationId, userText)` returns `{ text, complaintDetected }`:
- **Complaint keywords** (case-insensitive): `problema`, `error`, `fallo`, `no funciona`, `no anda`, `bug`, `queja`, `reclamo`
- If complaint detected → CEO asks if user wants support contact
- If no complaint → standard confirmation message
- `messages.ts` returns `complaintDetected` flag to frontend

### Support Ticket Flow (`email.service.ts` + `conversations.ts`)

`POST /api/conversations/:id/ticket`:
1. Fetches conversation, user, and last user message from DB
2. Sends 2 emails via Resend API (non-blocking, won't fail request):
   - **To `soporte@eldorado.io`**: from configured `EMAIL_FROM` with username, email, message text
   - **To user email**: from configured `EMAIL_FROM` confirming support will reach out
3. Updates conversation status to `ticket_opened`
4. Inserts CEO confirmation message
5. Returns `{ ceoResponse, ticketCreated: true }`

**Email guard:** If `RESEND_API_KEY` is not configured, emails are skipped with a `console.warn` (request still succeeds).

Future: swap `response.service.ts` to OpenAI with Guille's personality prompt.

### CEO Reply Flow (Admin → User)

`POST /api/admin/conversations/:id/reply` (JWT protected):
1. Inserts CEO message with `metadata: {"source": "admin"}`
2. Reactivates conversation (`status = 'active'`, `updated_at = NOW()`)
3. Returns the created message

Frontend polling (`useMessagePolling`) picks up admin replies by filtering `metadata.source === "admin"`. This prevents duplicate display of auto-generated CEO responses that were already shown locally.

### Message Polling (`useMessagePolling.ts`)

- Polls `GET /api/conversations/:id/messages?after=<timestamp>` every 5 seconds
- Only enabled after first message cycle completes (post-confetti) or for returning users
- Filters server responses to only surface admin CEO replies (`metadata.source === "admin"`)
- Deduplicates against existing messages by ID
- Plays received sound on new messages
- Non-critical: polling failures are silently caught

## Admin Dashboard (/admin)

Frontend route served from the same app. Entry point: `main.tsx` checks `window.location.pathname`.

**Components:**
- `AdminLogin` — password form → `POST /api/admin/login` → JWT stored in sessionStorage
- `AdminDashboard` — tabular view with 7 sortable columns (★, Usuario, Tema, Imp., Sentimiento, Estado, Fecha)
- `ConversationDetail` — full message thread + CEO reply input ("Responder como Guille...") + CEO notes + add note form

**Dashboard table layout:**
- Columns: Favorite star (toggle), User (name + email), Tema (category badge with tooltip for ai_summary), Importancia (numeric badge, red if >=4), Sentimiento (+/~/- colored), Estado (derived response_status badge), Fecha
- Client-side sorting: click column header to toggle asc/desc, yellow ▲/▼ indicator on active column
- Response status (`response_status`): derived server-side via CTE — `respondida` (admin replied), `con_comentario` (has CEO note), `pendiente` (last msg from user), `sin_comentario` (none)
- Filters: Status (active/closed/ticket), Categoría, Importancia (4+/5), Estado (response_status), Solo favoritos toggle
- Favorites: optimistic UI update on star click, PATCH to backend in background, revert on failure
- Container max-width: 1200px

**Mock Mode:** Password `123` activates offline mock data (5 sample conversations with threads, notes, favorites, and response_status). Useful for development without backend.

**Admin API client** (`admin-client.ts`): All calls check `sessionStorage('admin_mock')` — if true, returns hardcoded data instead of calling backend. Exports: `adminLogin`, `getConversations`, `toggleFavorite`, `getMessages`, `getNotes`, `sendReply`, `addNote`.

## Environment Variables

### Backend (`api/.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/talk_with_ceo   # Required
ADMIN_PASSWORD=change-me                                                # Required
JWT_SECRET=change-me-to-a-random-string                                 # Required
PORT=3001                                                               # Default: 3001
CORS_ORIGIN=http://localhost:5173                                       # Default: *
REDASH_BASE_URL=https://reports.eldorado.io                             # Default
REDASH_API_KEY=                                                         # Required for Redash
REDASH_USER_QUERY_ID=1464                                               # Default: 1464
RESEND_API_KEY=                                                         # Required for emails (Resend)
EMAIL_FROM=Guillermo - El Dorado <onboarding@resend.dev>                # Default sender
OPENAI_API_KEY=                                                         # Required for AI message analysis (gpt-4o-mini)
```

### Frontend (`app/.env`)
```
VITE_API_URL=                  # Empty = same origin (uses Vite proxy in dev)
```

### Vite Proxy (dev only)
`/api` → `http://localhost:3001` (configured in `vite.config.ts`)

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-primary` | `#0A0A0A` | Main background |
| `--color-bg-surface` | `#1A1A1A` | Bubbles, inputs |
| `--color-border-default` | `#333333` | Borders |
| `--color-border-focus` | `#FFFF00` | Focus state |
| `--color-text-primary` | `#FFFFFF` | Primary text |
| `--color-text-secondary` | `#999999` | Timestamps |
| `--color-text-muted` | `#666666` | Placeholders |
| `--color-accent-primary` | `#FFFF00` | Send button, accents |
| `--color-accent-success` | `#00FF88` | Positive pill |
| `--color-accent-danger` | `#FF4444` | Frustrated pill |
| `--color-accent-info` | `#4488FF` | Talk pill |
| `--color-online-green` | `#00D26A` | Online dot |

## Style Guidelines

### CSS/Tailwind
- **Tailwind v4**: use `@theme` in `index.css` for custom tokens, not `tailwind.config`
- **Inline styles for critical layout**: padding, max-width, and font-size in bubbles use inline styles (not Tailwind classes) because arbitrary values may not apply correctly with HMR
- **Container**: max-w-[480px] centered for chat, max-w-[1200px] for admin dashboard

### Components
- **Language**: All copy in Argentine Spanish (vos, escribi, contame)
- **Sounds**: `msg-sent.mp3` / `msg-received.mp3`, volume 30%
- **Wallpaper**: 4 illustrations in grid with opacity 35%, saturate 0.8
- **CEO bubbles**: max-width 65%, bg `#1f1f1f`, border `rgba(60,60,60,0.6)`, font 14px
- **User bubbles**: yellow bg `#FFFF00`, black text
- **Animations**: Framer Motion `type: 'spring'` for entrances, `AnimatePresence` for exits

### Assets
- Product assets used by the app: `app/public/assets/`
- Full El Dorado design library (reference only): `assets/`
- CEO video: `video_guille.mp4` / CEO photo: `guille.jpeg`

#### Assets actively used (17 files)
- `guille.jpeg` — CEO photo (AvatarCircle)
- `logo.svg` — El Dorado logo (SplashScreen, StatusBar)
- `video_guille.mp4` — CEO video (VideoBubble)
- `msg-sent.mp3` — Send sound / `msg-received.mp3` — Receive sound
- `tarjeta.webp`, `mj-st4.webp`, `conta-em-dolares.webp`, `p2p-optimizado.webp` — Wallpaper
- `tarjeta-eldorado.webp`, `mj-st5.webp`, `criptos-disponibles.avif`, `mockup-usd.png` — Decoration
- `tag-usd.svg`, `tag-cripto.svg`, `tag-p2p.svg` — Floating asset tags
- `qr-code.png` — QR code image

#### Unused assets (3 files)
- `mockup-celular-mundo.avif`, `msg-sent-short.mp3` (0 bytes), `tag-tarjeta.svg`

## Components NOT Currently Integrated

These exist but are not in the main flow:
- `MoodSelector.tsx` / `MoodPill.tsx` — mood pills (removed from footer)
- `ProductStrip.tsx` — horizontal product marquee
- `decoration/FloatingAssets.tsx` — floating assets for desktop

## Local Storage Keys

| Key | Usage |
|-----|-------|
| `ceo-chat-conversation-id` | Persists conversationId for returning user detection |
| `ceo-chat-user-id` | Backend user UUID (set by `useUserIdentification`) |
| `ceo-chat-user-name` | Display name (set by `useUserIdentification`) |

## Zustand Store (`store.ts`)

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

## Deploy

- **Platform**: Railway (monorepo, single service)
- **Procfile**: `web: cd api && node dist/index.js`
- **Build**: Root `npm run build` → builds app + api
- **Runtime**: Express serves `app/dist/` as static files with SPA fallback
- **Database**: PostgreSQL (Railway managed)
- **SSL**: Auto-detected for non-localhost DATABASE_URL

## Reference Documents

- `docs/talk-with-ceo-spec.md` — Product spec (hero, inputs, tone of voice)
- `docs/forms.csv` — CEO Guille's alignment questionnaire responses
- `docs/infos.txt` — Backend requirements and roadmap notes (Portuguese)
- `inst2.md` — Redash integration and engagement routing instructions

## Future Roadmap

1. **Conversational AI** — swap `response.service.ts` to OpenAI with Guille's personality prompt
2. ~~**Complaint detection**~~ — ✅ Implemented: keyword-based detection + inline Sí/No buttons
3. ~~**Ticket opening via email**~~ — ✅ Implemented: migrated from Nodemailer/SMTP to Resend API
4. ~~**CEO reply from admin**~~ — ✅ Implemented: admin reply input + message polling (5s interval)
5. ~~**Conversation continuity**~~ — ✅ Implemented: localStorage persistence + returning user flow + follow-up messages
6. **Host app userId** — replace username popup with hashed userId from host app
7. **CEO video via CDN** — serve from bucket to swap without redeploy
8. **Database migration runner** — migrations exist but no automated runner yet
9. **WebSocket for real-time** — replace 5s polling with WebSocket/SSE for instant CEO reply delivery
10. ~~**Admin dashboard table layout**~~ — ✅ Implemented: tabular view with 7 sortable columns, favorites, response_status derived via CTE, client-side sorting
11. ~~**AI message analysis**~~ — ✅ Implemented: OpenAI gpt-4o-mini classifies messages (category, importance 1-5, sentiment, summary) via `analysis.service.ts`
12. **AI-driven complaint detection** — Replace keyword-based complaint detection with AI analysis results. Make `analyzeMessage` synchronous (awaited, 3s timeout) and use `category === 'reclamo' || 'bug'` to trigger the support ticket offer flow. Fall back to keyword detection if AI fails/times out. Files: `analysis.service.ts` (return analysis result), `messages.ts` (await + timeout + use result), `response.service.ts` (accept override param)
13. **Custom email domain** — Verify `eldorado.io` domain in Resend to send emails as `guille@eldorado.io` instead of `onboarding@resend.dev`. Requires DNS records (SPF, DKIM) added by infra team
