# Talk with the CEO — "Habla con Guille"

Miniapp for El Dorado (LATAM fintech superapp) that lets users send messages directly to CEO Guille. The interface simulates a WhatsApp-style chat conversation — not a form, but a conversational experience.

## Stack

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS 4** with `@tailwindcss/vite` (uses `@theme` directive for tokens)
- **Framer Motion 12** for animations (bubbles, springs, transitions)
- **Zustand 5** for global state management
- **@fontsource/inter** (self-hosted)

## Commands

```bash
cd app
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build to dist/
npx tsc --noEmit # Type check without emitting
```

## Frontend Architecture

```
app/src/
  App.tsx                          # Orchestrator — splash → chat → input → confirmation
  store.ts                         # Zustand store (mood, messages, userName, userEmail)
  constants.ts                     # CEO texts, mood options, delays
  types/index.ts                   # AppState, MoodType, Message
  index.css                        # Tailwind + tokens + keyframes
  components/
    chat/
      ConversationThread.tsx       # Scrollable area — video + bubbles + typing
      ChatBubble.tsx               # Individual bubble (CEO=dark, user=yellow)
      VideoBubble.tsx              # Inline CEO video with play/pause
      AvatarCircle.tsx             # Circular avatar + online dot
      TypingIndicator.tsx          # 3 animated dots
      ChatWallpaper.tsx            # Decorative background with product assets
    input/
      MessageInput.tsx             # Auto-grow textarea + send button
      SendButton.tsx               # Yellow circular button
      NameField.tsx                # Optional name field (not currently used)
    layout/
      StatusBar.tsx                # Top bar — "Guille" + online dot + logo
    intro/
      SplashScreen.tsx             # Initial screen with logo + progress bar
      FloatingAssets.tsx           # Floating assets (used in splash)
      VideoIntro.tsx               # Fullscreen video intro (not integrated)
    mood/
      MoodSelector.tsx             # Horizontal pill container
      MoodPill.tsx                 # Individual pill with color
    confirmation/
      ConfettiEffect.tsx           # Yellow confetti canvas
      EmailFollowUp.tsx            # Post-send email input
      SupportRedirect.tsx          # Support link
    decoration/
      ProductStrip.tsx             # Horizontal product marquee
      FloatingAssets.tsx           # Floating assets for desktop
  hooks/
    useTypingSequence.ts           # Controls sequential bubble timing
    useSounds.ts                   # Plays received/sent sounds
    useAutoResize.ts               # Textarea auto-grow
    useFirstVisit.ts               # sessionStorage — splash only on first visit
```

## App Flow

1. **Splash** (first visit): El Dorado logo pulses + progress bar + floating assets (2.2s)
2. **Chat**: StatusBar + ConversationThread with CEO video + 3 sequential bubbles with typing indicator
3. **Input**: Textarea + send button appears after sequence completes
4. **Post-send**: User bubble → CEO typing → confirmation → confetti

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
- **Inline styles for critical layout**: padding, max-width, and font-size in bubbles use inline styles (not Tailwind classes) because arbitrary values (`max-w-[240px]`) may not apply correctly with HMR
- **Container**: max-w-[480px] centered, simulating a mobile screen on desktop

### Components
- **Language**: All copy in Argentine Spanish (vos, escribi, conta)
- **Sounds**: `msg-sent.mp3` used for both received/sent, volume 30%
- **Wallpaper**: 4 illustrations (tarjeta, mj-st4, conta-em-dolares, p2p-optimizado) distributed in grid with opacity 35%, saturate 0.8
- **CEO bubbles**: max-width 65%, bg `#1f1f1f`, border `rgba(60,60,60,0.6)`, font 14px
- **User bubbles**: yellow bg `#FFFF00`, black text
- **Animations**: use Framer Motion with `type: 'spring'` for entrances, `AnimatePresence` for exits

### Assets
- Product assets used by the app: `app/public/assets/`
- Full El Dorado design library (reference only, not used by app): `assets/`
- CEO video: `video_guille.mp4`
- CEO photo: `guille.jpeg`

#### Assets actively used by the app (16 files)
- `guille.jpeg` — CEO photo (AvatarCircle)
- `logo.svg` — El Dorado logo (SplashScreen, StatusBar)
- `video_guille.mp4` — CEO video (VideoBubble, VideoIntro)
- `msg-sent.mp3` — Send sound (useSounds)
- `msg-received.mp3` — Receive sound (useSounds)
- `tarjeta.webp`, `mj-st4.webp`, `conta-em-dolares.webp`, `p2p-optimizado.webp` — Wallpaper + floating assets
- `tarjeta-eldorado.webp`, `mj-st5.webp`, `criptos-disponibles.avif`, `mockup-usd.png` — Decoration components
- `tag-usd.svg`, `tag-cripto.svg`, `tag-p2p.svg` — Floating asset tags

#### Unused assets in `app/public/assets/` (3 files)
- `mockup-celular-mundo.avif` — Not referenced in code
- `msg-sent-short.mp3` — Not referenced in code
- `tag-tarjeta.svg` — Not referenced in code

## Components NOT Currently Integrated

These components exist but are not in the main `App.tsx` flow:
- `VideoIntro.tsx` — fullscreen video screen before chat
- `MoodSelector.tsx` / `MoodPill.tsx` — mood pills (removed from footer)
- `EmailFollowUp.tsx` — post-send email collection
- `SupportRedirect.tsx` — Intercom support link
- `ProductStrip.tsx` — horizontal product marquee
- `NameField.tsx` — optional name field
- `decoration/FloatingAssets.tsx` — floating assets for desktop

Can be re-integrated as needed.

## Reference Documents

- `docs/talk-with-ceo-spec.md` — Product spec (hero, inputs, tone of voice)
- `docs/forms.csv` — CEO Guille's alignment questionnaire responses
- `docs/infos.txt` — Backend requirements and roadmap notes
- `.claude/plans/reactive-frolicking-hearth.md` — Original implementation plan

## Backend + Database (ALIGNED DECISIONS)

### Current Frontend State
The app is 100% frontend. Message sending currently:
1. Adds to local state (Zustand) in `App.tsx:handleSend`
2. Does `console.log` of the data
3. Shows hardcoded confirmation (`CEO_CONFIRMATION_MESSAGE` in `constants.ts`)
4. **Nothing is persisted** — if you reload, everything is lost

The Zustand store (`store.ts`) already has `mood`, `userName`, `userEmail`, `messages` fields.
The main integration point is `App.tsx:handleSend`.

### User Identification (MVP)
- Popup on first visit: "What's your username?"
- Username saved to `localStorage` + `POST /api/users`
- Next visits: reads localStorage, goes straight to chat
- **Future**: replace popup with hashed userId from the host app (backend doesn't change — it receives `external_id` from any source)

### ERD (Entity-Relationship Diagram)

```
users
  id              UUID PK
  external_id     TEXT UNIQUE    ← username (MVP) or userId from app (future)
  email           TEXT nullable
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

conversations
  id              UUID PK
  user_id         UUID FK → users
  rating          INT nullable   ← 0-5, optional (user can skip)
  status          ENUM           ← 'active' | 'closed' | 'ticket_opened'
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

**Design decisions:**
- `rating` belongs to `conversations` (1 rating per interaction, not per message)
- `metadata` JSONB on messages = flexible (today stores mood, tomorrow stores AI data)
- Sums and averages = computed queries, not stored fields
- `ceo_notes` separate table for Guille's dashboard comments

### Backend Architecture

```
api/                              ← NEW — Node.js backend
  src/
    index.ts                      # Entry point, Express setup
    config.ts                     # Env vars (DB_URL, ADMIN_PASSWORD, PORT)
    db/
      client.ts                   # PostgreSQL connection
      schema.sql                  # Table DDL
      migrations/                 # Schema versioning
    routes/
      users.ts                    # POST /api/users
      conversations.ts            # Conversation CRUD
      messages.ts                 # POST messages
      rating.ts                   # PATCH rating
      admin.ts                    # Login + list + comment
    services/
      response.service.ts         # Generates CEO response (MVP: fixed | future: AI)
      ticket.service.ts           # Opens ticket via email
    middleware/
      admin-auth.ts               # Verifies CEO JWT
```

### API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/users` | Create/identify user (external_id + email) |
| `POST` | `/api/conversations` | Start conversation (returns conversation_id) |
| `POST` | `/api/conversations/:id/messages` | Send message (returns CEO response) |
| `PATCH` | `/api/conversations/:id/rating` | Rating 0-5 (optional, user can skip) |
| `GET` | `/api/users/:id/conversations` | User history (future roadmap) |
| `POST` | `/api/admin/login` | Password → JWT token |
| `GET` | `/api/admin/conversations` | List all conversations (filters: date, rating, status) |
| `POST` | `/api/admin/conversations/:id/notes` | CEO adds comment |
| `POST` | `/api/conversations/:id/ticket` | Open ticket via email (future roadmap) |

### AI Preparation (OpenAI)

`response.service.ts` abstracts response generation:

```typescript
// MVP: fixed response
export async function generateResponse(conversation): Promise<string> {
  return CEO_CONFIRMATION_MESSAGE;
}

// FUTURE: swap to AI — same endpoint, same contract
export async function generateResponse(conversation): Promise<string> {
  const history = await getMessages(conversation.id);
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    system: GUILLE_CONTEXT_PROMPT,
    messages: history.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))
  });
  return response.choices[0].message.content;
}
```

**To integrate AI in the future:**
1. Remove send confirmation popup
2. Swap response.service to call OpenAI
3. Train prompt with Guille's context (personality, tone, limits)
4. AI detects complaints → asks if user wants to open a ticket
5. Frontend already supports N messages in thread (conversation model)

### Complete Flow (MVP)

```
1.  User opens miniapp
2.  Popup: "What's your username?" → POST /api/users → localStorage
3.  CEO video + sequential bubbles (current flow)
4.  User writes message
5.  Confirmation popup: "Are you sure?" → "Yes, send it" / "Let me modify"
6.  POST /api/conversations → conversation_id
7.  POST /api/conversations/:id/messages {text, metadata: {mood}}
8.  Backend saves + returns fixed CEO response
9.  Rating popup: stars 0-5 → PATCH /api/conversations/:id/rating (can skip)
10. Final screen: "Thanks! Guille will read your message."
```

### CEO Dashboard (/admin)

- Same URL, `/admin` route
- Password login (verified by backend, returns JWT)
- Lists all conversations: userId, timestamp, message, rating
- CEO can add comments (ceo_notes)
- Filters: by date, by rating, by status

### Future Roadmap

1. **Conversation history** — show user's past conversations
2. **Conversational AI** — swap response.service to OpenAI with Guille's context
3. **Complaint detection** — AI identifies issues, asks if user wants to open a ticket
4. **Ticket opening via email** — sends email to company support system
5. **Host app userId** — replace popup with real userId when integration is ready
6. **CEO video via CDN** — serve from bucket to swap without redeploy

## Project Structure (Root)

```
talk_with_ceo/
  CLAUDE.md                      # This file — project context for Claude
  app/                           # Frontend (React + Vite)
  api/                           # Backend (Node.js) — TO BE CREATED
  assets/                        # El Dorado design library (reference, not used by app)
  docs/                          # Reference documents
    talk-with-ceo-spec.md        # Product spec
    forms.csv                    # CEO questionnaire responses
    infos.txt                    # Backend requirements notes
```

## Deploy

- Target: Railway (per spec)
- Frontend: `cd app && npm run build` generates `dist/`
- Backend: `cd api && npm start`
- DB: PostgreSQL (Railway managed or external)
- Both on same Railway deploy (monorepo) or separate services
