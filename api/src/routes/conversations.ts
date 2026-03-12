import { Router } from 'express';
import { query } from '../db/client.js';

const router = Router();

interface ConversationRow {
  id: string;
  user_id: string;
  rating: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// POST /api/conversations — start a new conversation
router.post('/', async (req, res) => {
  const { user_id } = req.body as { user_id?: string };

  if (!user_id || typeof user_id !== 'string') {
    res.status(400).json({ error: 'user_id is required' });
    return;
  }

  const result = await query<ConversationRow>(
    `INSERT INTO conversations (user_id) VALUES ($1) RETURNING *`,
    [user_id],
  );

  res.status(201).json(result.rows[0]);
});

export default router;
