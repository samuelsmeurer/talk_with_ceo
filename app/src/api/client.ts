const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || res.statusText);
  }
  return res.json();
}

export interface EngagementResult {
  flow: 'inactive' | 'warmup' | 'vip' | 'regular';
  message: string;
  firstName: string | null;
  metrics: {
    vol_total: number;
    tx_total: number;
    rank_vol_total: number;
    rank_tx_total: number;
  };
}

export interface UserResponse {
  id: string;
  external_id: string;
  email: string | null;
  first_name: string | null;
  engagement: EngagementResult | null;
}

export function createOrIdentifyUser(externalId: string, email?: string) {
  return request<UserResponse>(
    '/api/users',
    {
      method: 'POST',
      body: JSON.stringify({ external_id: externalId, email }),
    }
  );
}

export function startConversation(userId: string) {
  return request<{ id: string; user_id: string; status: string }>(
    '/api/conversations',
    {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }
  );
}

export function sendMessage(
  conversationId: string,
  text: string,
  metadata?: Record<string, unknown>
) {
  return request<{
    userMessage: { id: string; text: string; sender: string };
    ceoResponse: { id: string; text: string; sender: string };
  }>(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ sender: 'user', text, metadata }),
  });
}

export function rateConversation(conversationId: string, rating: number) {
  return request<{ id: string; rating: number }>(
    `/api/conversations/${conversationId}/rating`,
    {
      method: 'PATCH',
      body: JSON.stringify({ rating }),
    }
  );
}
