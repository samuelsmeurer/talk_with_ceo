import { Router } from 'express';
import { query } from '../db/client.js';

const router = Router();

interface UserRow {
  id: string;
  external_id: string;
  email: string | null;
}

// POST /api/users — create or update user by external_id
router.post('/', async (req, res) => {
  const { external_id, email } = req.body as { external_id?: string; email?: string };

  if (!external_id || typeof external_id !== 'string') {
    res.status(400).json({ error: 'external_id is required' });
    return;
  }

  const result = await query<UserRow>(
    `INSERT INTO users (external_id, email)
     VALUES ($1, $2)
     ON CONFLICT (external_id) DO UPDATE
       SET email = COALESCE(EXCLUDED.email, users.email),
           updated_at = now()
     RETURNING id, external_id, email`,
    [external_id, email ?? null],
  );

  res.status(200).json(result.rows[0]);
});

export default router;
