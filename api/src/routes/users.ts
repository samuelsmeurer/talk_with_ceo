import { Router } from 'express';
import { query } from '../db/client.js';
import { fetchUserMetrics } from '../services/redash.service.js';
import { classifyEngagement } from '../services/engagement.service.js';
import type { EngagementResult } from '../types/redash.js';

const router = Router();

interface UserRow {
  id: string;
  external_id: string;
  email: string | null;
  first_name: string | null;
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
     RETURNING id, external_id, email, first_name`,
    [external_id, email ?? null],
  );

  const user = result.rows[0];

  let engagement: EngagementResult | null = null;

  try {
    const metrics = await fetchUserMetrics(external_id);

    if (metrics) {
      // Update email and first_name from Redash if available
      const redashEmail = metrics.email || null;
      const redashFirstName = metrics.firstName || null;

      if (redashEmail || redashFirstName) {
        const updated = await query<UserRow>(
          `UPDATE users
           SET email = COALESCE($1, email),
               first_name = COALESCE($2, first_name),
               updated_at = now()
           WHERE id = $3
           RETURNING id, external_id, email, first_name`,
          [redashEmail, redashFirstName, user.id],
        );
        Object.assign(user, updated.rows[0]);
      }

      engagement = classifyEngagement(metrics);
    }
  } catch (error) {
    console.warn('[users] Redash enrichment failed:', error instanceof Error ? error.message : error);
  }

  res.status(200).json({ ...user, engagement });
});

export default router;
