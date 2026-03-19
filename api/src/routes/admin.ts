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
  ai_category: string | null;
  ai_importance: number | null;
  ai_sentiment: string | null;
  ai_summary: string | null;
  is_favorited: boolean;
  response_status: string;
  created_at: string;
  updated_at: string;
}

// GET /api/admin/conversations — list all conversations with filters
router.get('/conversations', adminAuth, async (req, res) => {
  const { status, rating_min, rating_max, category, importance_min, sentiment, favorited, response_status, limit, offset } = req.query as {
    status?: string;
    rating_min?: string;
    rating_max?: string;
    category?: string;
    importance_min?: string;
    sentiment?: string;
    favorited?: string;
    response_status?: string;
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
  if (category) {
    conditions.push(`c.ai_category = $${paramIndex++}`);
    params.push(category);
  }
  if (importance_min) {
    conditions.push(`c.ai_importance >= $${paramIndex++}`);
    params.push(parseInt(importance_min, 10));
  }
  if (sentiment) {
    conditions.push(`c.ai_sentiment = $${paramIndex++}`);
    params.push(sentiment);
  }
  if (favorited === 'true') {
    conditions.push(`c.is_favorited = true`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitVal = parseInt(limit ?? '50', 10);
  const offsetVal = parseInt(offset ?? '0', 10);

  const result = await query<ConversationListRow>(
    `WITH conv_status AS (
       SELECT
         c.id,
         c.user_id,
         u.external_id,
         u.email,
         c.rating,
         c.status,
         c.ai_category,
         c.ai_importance,
         c.ai_sentiment,
         c.ai_summary,
         c.is_favorited,
         c.created_at,
         c.updated_at,
         COUNT(m.id)::TEXT AS message_count,
         CASE
           WHEN EXISTS (
             SELECT 1 FROM messages mr
             WHERE mr.conversation_id = c.id
               AND mr.sender = 'ceo'
               AND mr.metadata->>'source' = 'admin'
           ) THEN 'respondida'
           WHEN EXISTS (
             SELECT 1 FROM ceo_notes cn
             WHERE cn.conversation_id = c.id
           ) THEN 'con_comentario'
           WHEN (
             SELECT ms.sender FROM messages ms
             WHERE ms.conversation_id = c.id
             ORDER BY ms.created_at DESC LIMIT 1
           ) = 'user' THEN 'pendiente'
           ELSE 'sin_comentario'
         END AS response_status
       FROM conversations c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN messages m ON m.conversation_id = c.id
       ${where}
       GROUP BY c.id, u.external_id, u.email
     )
     SELECT * FROM conv_status
     ${response_status ? `WHERE response_status = $${paramIndex++}` : ''}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, ...(response_status ? [response_status] : []), limitVal, offsetVal],
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

// POST /api/admin/conversations/:id/reply — CEO sends a reply to user
router.post('/conversations/:id/reply', adminAuth, async (req, res) => {
  const conversationId = req.params.id;
  const { text } = req.body as { text?: string };

  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const msg = await query<MessageRow>(
    `INSERT INTO messages (conversation_id, sender, text, metadata)
     VALUES ($1, 'ceo', $2, '{"source":"admin"}')
     RETURNING *`,
    [conversationId, text],
  );

  // Reactivate conversation
  await query(
    `UPDATE conversations SET status = 'active', updated_at = NOW() WHERE id = $1`,
    [conversationId],
  );

  res.status(201).json(msg.rows[0]);
});

// PATCH /api/admin/conversations/:id/favorite — toggle favorite
router.patch('/conversations/:id/favorite', adminAuth, async (req, res) => {
  const conversationId = req.params.id;

  const result = await query<{ id: string; is_favorited: boolean }>(
    `UPDATE conversations
     SET is_favorited = NOT is_favorited, updated_at = NOW()
     WHERE id = $1
     RETURNING id, is_favorited`,
    [conversationId],
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  res.status(200).json(result.rows[0]);
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
