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
      engagement = classifyEngagement(metrics);

      const redashEmail = metrics.email || null;
      const redashFirstName = metrics.firstName || null;

      const updated = await query<UserRow>(
        `UPDATE users
         SET email = COALESCE($1, email),
             first_name = COALESCE($2, first_name),
             vol_total = $3,
             vol_30d = $4,
             tx_total = $5,
             tx_30d = $6,
             rank_vol_total = $7,
             rank_vol_30d = $8,
             rank_tx_total = $9,
             rank_tx_30d = $10,
             engagement_flow = $11,
             metrics_updated_at = now(),
             updated_at = now()
         WHERE id = $12
         RETURNING id, external_id, email, first_name`,
        [
          redashEmail,
          redashFirstName,
          metrics.vol_total,
          metrics.vol_30d,
          metrics.tx_total,
          metrics.tx_30d,
          metrics.rank_vol_total,
          metrics.rank_vol_30d,
          metrics.rank_tx_total,
          metrics.rank_tx_30d,
          engagement.flow,
          user.id,
        ],
      );
      Object.assign(user, updated.rows[0]);
    }
  } catch (error) {
    console.warn('[users] Redash enrichment failed:', error instanceof Error ? error.message : error);
  }

  res.status(200).json({ ...user, engagement });
});

export default router;
