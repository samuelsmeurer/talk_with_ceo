import { Router } from 'express';
import { query } from '../db/client.js';
import { generateResponse } from '../services/response.service.js';
import { analyzeMessage } from '../services/analysis.service.js';

const router = Router();

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender: string;
  text: string;
  metadata: unknown;
  created_at: string;
}

// GET /api/conversations/:id/messages — fetch messages (supports ?after= for polling)
router.get('/:id/messages', async (req, res) => {
  const conversationId = req.params.id;
  const after = req.query.after as string | undefined;

  let sql = `SELECT id, conversation_id, sender, text, metadata, created_at
     FROM messages
     WHERE conversation_id = $1`;
  const params: unknown[] = [conversationId];

  if (after) {
    sql += ` AND created_at > $2`;
    params.push(after);
  }

  sql += ` ORDER BY created_at ASC`;

  const result = await query<MessageRow>(sql, params);
  res.status(200).json(result.rows);
});

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
    // AI analysis with 3s timeout — drives complaint detection, falls back to keywords
    const analysis = await withTimeout(analyzeMessage(userMsg.rows[0].id, text), 3000).catch(() => null);

    const result = await generateResponse(conversationId, text, { aiCategory: analysis?.category });
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
