import { Router } from 'express';
import { query } from '../db/client.js';
import { generateResponse } from '../services/response.service.js';

const router = Router();

interface MessageRow {
  id: string;
  conversation_id: string;
  sender: string;
  text: string;
  metadata: unknown;
  created_at: string;
}

// POST /api/conversations/:id/messages — send a message
router.post('/:id/messages', async (req, res) => {
  const conversationId = req.params.id;
  const { sender, text, metadata } = req.body as {
    sender?: string;
    text?: string;
    metadata?: object;
  };

  if (!sender || !['user', 'ceo', 'system'].includes(sender)) {
    res.status(400).json({ error: 'sender must be user, ceo, or system' });
    return;
  }
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const userMsg = await query<MessageRow>(
    `INSERT INTO messages (conversation_id, sender, text, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [conversationId, sender, text, metadata ? JSON.stringify(metadata) : null],
  );

  let ceoResponse: MessageRow | undefined;
  let complaintDetected = false;

  if (sender === 'user') {
    const result = await generateResponse(conversationId, text);
    complaintDetected = result.complaintDetected;

    const ceoResult = await query<MessageRow>(
      `INSERT INTO messages (conversation_id, sender, text)
       VALUES ($1, 'ceo', $2)
       RETURNING *`,
      [conversationId, result.text],
    );
    ceoResponse = ceoResult.rows[0];
  }

  res.status(201).json({
    userMessage: userMsg.rows[0],
    ...(ceoResponse && { ceoResponse }),
    complaintDetected,
  });
});

export default router;
