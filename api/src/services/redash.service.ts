import { config } from '../config.js';
import type { RedashQueryResult, UserMetricsRow } from '../types/redash.js';

const POLL_INTERVAL = 1000;
const MAX_WAIT = 15_000;

interface RedashJobResponse {
  job: { id: string; status: number };
}

function isJobResponse(data: unknown): data is RedashJobResponse {
  return typeof data === 'object' && data !== null && 'job' in data;
}

async function pollJobResult<TRow>(
  jobId: string,
): Promise<TRow[] | null> {
  const url = `${config.redashBaseUrl}/api/jobs/${jobId}`;
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));

    const res = await fetch(url, {
      headers: { 'Authorization': `Key ${config.redashApiKey}` },
    });

    if (!res.ok) {
      console.warn(`[redash] Job ${jobId} poll returned ${res.status}`);
      return null;
    }

    const data = await res.json() as { job: { status: number; query_result_id?: number; error?: string } };

    // status 3 = finished, 4 = failed
    if (data.job.status === 4) {
      console.warn(`[redash] Job ${jobId} failed:`, data.job.error);
      return null;
    }

    if (data.job.status === 3 && data.job.query_result_id) {
      const resultUrl = `${config.redashBaseUrl}/api/query_results/${data.job.query_result_id}`;
      const resultRes = await fetch(resultUrl, {
        headers: { 'Authorization': `Key ${config.redashApiKey}` },
      });

      if (!resultRes.ok) return null;

      const result = (await resultRes.json()) as RedashQueryResult<TRow>;
      return result.query_result.data.rows;
    }
  }

  console.warn(`[redash] Job ${jobId} timed out after ${MAX_WAIT}ms`);
  return null;
}

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

    const data = await response.json();

    // Redash returns a job when the query needs to run (not cached)
    if (isJobResponse(data)) {
      console.log(`[redash] Query ${queryId} running as job ${data.job.id}, polling...`);
      return pollJobResult<TRow>(data.job.id);
    }

    const result = data as RedashQueryResult<TRow>;
    if (!result.query_result?.data?.rows) {
      console.warn(`[redash] Query ${queryId} returned unexpected format`);
      return null;
    }

    return result.query_result.data.rows;
  } catch (error) {
    console.warn(`[redash] Query ${queryId} failed:`, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function fetchUserMetrics(username: string): Promise<UserMetricsRow | null> {
  const rows = await executeQuery<UserMetricsRow>(config.redashUserQueryId, {
    user: username,
  });

  if (!rows || rows.length === 0) return null;
  return rows[0];
}
