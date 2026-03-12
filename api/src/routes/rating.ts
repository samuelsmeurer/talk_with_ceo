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

// PATCH /api/conversations/:id/rating — set rating 0-5
router.patch('/:id/rating', async (req, res) => {
  const conversationId = req.params.id;
  const { rating } = req.body as { rating?: number };

  if (rating === undefined || typeof rating !== 'number' || rating < 0 || rating > 5) {
    res.status(400).json({ error: 'rating must be a number between 0 and 5' });
    return;
  }

  const result = await query<ConversationRow>(
    `UPDATE conversations
     SET rating = $1, updated_at = now()
     WHERE id = $2
     RETURNING *`,
    [rating, conversationId],
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  res.status(200).json(result.rows[0]);
});

export default router;
