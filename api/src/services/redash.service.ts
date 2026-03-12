import { config } from '../config.js';
import type { RedashQueryResult, UserMetricsRow } from '../types/redash.js';

export async function executeQuery<TRow>(
  queryId: string,
  params: Record<string, string>,
): Promise<TRow[] | null> {
  if (!config.redashApiKey) {
    console.warn('[redash] No API key configured, skipping query');
    return null;
  }

  const url = `${config.redashBaseUrl}/api/queries/${queryId}/results`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${config.redashApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parameters: params }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[redash] Query ${queryId} returned ${response.status}`);
      return null;
    }

    const data = (await response.json()) as RedashQueryResult<TRow>;
    return data.query_result.data.rows;
  } catch (error) {
    console.warn(`[redash] Query ${queryId} failed:`, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function fetchUserMetrics(username: string): Promise<UserMetricsRow | null> {
  const rows = await executeQuery<UserMetricsRow>(config.redashUserQueryId, {
    p_user: username,
  });

  if (!rows || rows.length === 0) return null;
  return rows[0];
}
