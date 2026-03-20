import { Router } from 'express';
import { query } from '../db/client.js';
import { sendSupportTicket, sendUserConfirmation } from '../services/email.service.js';

const router = Router();

interface ConversationRow {
  id: string;
  user_id: string;
  rating: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserRow {
  id: string;
  external_id: string;
  email: string | null;
  first_name: string | null;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender: string;
  text: string;
  metadata: unknown;
  created_at: string;
}

// POST /api/conversations — start or reuse conversation
router.post('/', async (req, res) => {
  const { user_id } = req.body as { user_id?: string };

  if (!user_id || typeof user_id !== 'string') {
    res.status(400).json({ error: 'user_id is required' });
    return;
  }

  // Reuse existing conversation if one exists for this user
  const existing = await query<ConversationRow>(
    `SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [user_id],
  );

  if (existing.rows.length > 0) {
    res.status(200).json({ ...existing.rows[0], isNew: false });
    return;
  }

  const result = await query<ConversationRow>(
    `INSERT INTO conversations (user_id) VALUES ($1) RETURNING *`,
    [user_id],
  );

  res.status(201).json({ ...result.rows[0], isNew: true });
});

// POST /api/conversations/:id/ticket — create support ticket
router.post('/:id/ticket', async (req, res) => {
  const conversationId = req.params.id;

  // Fetch conversation + user
  const convResult = await query<ConversationRow>(
    `SELECT * FROM conversations WHERE id = $1`,
    [conversationId],
  );
  if (convResult.rows.length === 0) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }
  const conversation = convResult.rows[0];

  const userResult = await query<UserRow>(
    `SELECT id, external_id, email, first_name FROM users WHERE id = $1`,
    [conversation.user_id],
  );
  const user = userResult.rows[0];

  // Get last user message
  const msgResult = await query<MessageRow>(
    `SELECT * FROM messages
     WHERE conversation_id = $1 AND sender = 'user'
     ORDER BY created_at DESC LIMIT 1`,
    [conversationId],
  );
  const userMessage = msgResult.rows[0];

  // Send emails (fire-and-forget — don't block the response)
  sendSupportTicket(
    user.external_id,
    user.email,
    userMessage?.text ?? '',
  ).catch(() => {});

  if (user.email) {
    const firstName = user.first_name || user.external_id;
    sendUserConfirmation(user.email, firstName).catch(() => {});
  }

  // Update conversation status
  await query(
    `UPDATE conversations SET status = 'ticket_opened', updated_at = NOW() WHERE id = $1`,
    [conversationId],
  );

  // Insert CEO confirmation message
  const ceoText =
    '¡Listo! Ya hablé con el equipo de soporte, se van a comunicar con vos en los próximos minutos.';

  const ceoResult = await query<MessageRow>(
    `INSERT INTO messages (conversation_id, sender, text)
     VALUES ($1, 'ceo', $2)
     RETURNING *`,
    [conversationId, ceoText],
  );

  res.status(201).json({
    ceoResponse: ceoResult.rows[0],
    ticketCreated: true,
  });
});

export default router;
