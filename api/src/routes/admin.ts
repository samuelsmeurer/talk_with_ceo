import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query } from '../db/client.js';
import { adminAuth } from '../middleware/admin-auth.js';

const router = Router();

// POST /api/admin/login — password → JWT
router.post('/login', (req, res) => {
  const { password } = req.body as { password?: string };

  if (password !== config.adminPassword) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  const token = jwt.sign({ role: 'admin' }, config.jwtSecret, { expiresIn: '24h' });
  res.status(200).json({ token });
});

interface ConversationListRow {
  id: string;
  user_id: string;
  external_id: string;
  email: string | null;
  rating: number | null;
  status: string;
  message_count: string;
  created_at: string;
  updated_at: string;
}

// GET /api/admin/conversations — list all conversations with filters
router.get('/conversations', adminAuth, async (req, res) => {
  const { status, rating_min, rating_max, limit, offset } = req.query as {
    status?: string;
    rating_min?: string;
    rating_max?: string;
    limit?: string;
    offset?: string;
  };

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (status) {
    conditions.push(`c.status = $${paramIndex++}`);
    params.push(status);
  }
  if (rating_min) {
    conditions.push(`c.rating >= $${paramIndex++}`);
    params.push(parseInt(rating_min, 10));
  }
  if (rating_max) {
    conditions.push(`c.rating <= $${paramIndex++}`);
    params.push(parseInt(rating_max, 10));
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitVal = parseInt(limit ?? '50', 10);
  const offsetVal = parseInt(offset ?? '0', 10);

  const result = await query<ConversationListRow>(
    `SELECT c.id, c.user_id, u.external_id, u.email,
            c.rating, c.status, c.created_at, c.updated_at,
            COUNT(m.id)::TEXT AS message_count
     FROM conversations c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN messages m ON m.conversation_id = c.id
     ${where}
     GROUP BY c.id, u.external_id, u.email
     ORDER BY c.created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limitVal, offsetVal],
  );

  res.status(200).json(result.rows);
});

interface CeoNoteRow {
  id: string;
  conversation_id: string;
  text: string;
  created_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender: string;
  text: string;
  metadata: unknown;
  created_at: string;
}

// GET /api/admin/conversations/:id/messages — list messages for a conversation
router.get('/conversations/:id/messages', adminAuth, async (req, res) => {
  const conversationId = req.params.id;

  const result = await query<MessageRow>(
    `SELECT id, conversation_id, sender, text, metadata, created_at
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId],
  );

  res.status(200).json(result.rows);
});

// GET /api/admin/conversations/:id/notes — list notes for a conversation
router.get('/conversations/:id/notes', adminAuth, async (req, res) => {
  const conversationId = req.params.id;

  const result = await query<CeoNoteRow>(
    `SELECT id, conversation_id, text, created_at
     FROM ceo_notes
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId],
  );

  res.status(200).json(result.rows);
});

// POST /api/admin/conversations/:id/notes — CEO adds a comment
router.post('/conversations/:id/notes', adminAuth, async (req, res) => {
  const conversationId = req.params.id;
  const { text } = req.body as { text?: string };

  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const result = await query<CeoNoteRow>(
    `INSERT INTO ceo_notes (conversation_id, text)
     VALUES ($1, $2)
     RETURNING *`,
    [conversationId, text],
  );

  res.status(201).json(result.rows[0]);
});

export default router;
