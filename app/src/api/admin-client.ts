import type { AdminConversation, AdminMessage, CeoNote } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'admin_token';
const MOCK_MODE_KEY = 'admin_mock';

function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(MOCK_MODE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

function isMock(): boolean {
  return sessionStorage.getItem(MOCK_MODE_KEY) === '1';
}

async function authRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });
  if (res.status === 401) {
    clearToken();
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || res.statusText);
  }
  return res.json();
}

// ── Mock data for local testing ──────────────────────────────

const MOCK_CONVERSATIONS: AdminConversation[] = [
  {
    id: 'conv-001',
    user_id: 'u1',
    external_id: 'santiago_crypto',
    email: 'santiago@gmail.com',
    rating: 5,
    status: 'closed',
    message_count: '4',
    created_at: '2025-03-10T14:30:00Z',
    updated_at: '2025-03-10T14:35:00Z',
  },
  {
    id: 'conv-002',
    user_id: 'u2',
    external_id: 'maria_jose',
    email: 'majo@hotmail.com',
    rating: 3,
    status: 'active',
    message_count: '2',
    created_at: '2025-03-11T09:15:00Z',
    updated_at: '2025-03-11T09:20:00Z',
  },
  {
    id: 'conv-003',
    user_id: 'u3',
    external_id: 'carlos_ba',
    email: null,
    rating: null,
    status: 'active',
    message_count: '3',
    created_at: '2025-03-11T18:00:00Z',
    updated_at: '2025-03-11T18:10:00Z',
  },
  {
    id: 'conv-004',
    user_id: 'u4',
    external_id: 'lucia_mendoza',
    email: 'lu.mendoza@yahoo.com',
    rating: 1,
    status: 'ticket_opened',
    message_count: '5',
    created_at: '2025-03-12T08:00:00Z',
    updated_at: '2025-03-12T08:30:00Z',
  },
  {
    id: 'conv-005',
    user_id: 'u5',
    external_id: 'pedro_usdt',
    email: 'pedro@proton.me',
    rating: 4,
    status: 'closed',
    message_count: '2',
    created_at: '2025-03-09T20:45:00Z',
    updated_at: '2025-03-09T20:50:00Z',
  },
];

const MOCK_MESSAGES: Record<string, AdminMessage[]> = {
  'conv-001': [
    { id: 'm1', conversation_id: 'conv-001', sender: 'ceo', text: '¡Hola! Soy Guille, CEO de El Dorado. Contame, ¿en qué puedo ayudarte?', metadata: null, created_at: '2025-03-10T14:30:00Z' },
    { id: 'm2', conversation_id: 'conv-001', sender: 'user', text: 'Guille, genio! Quería decirte que la app está increíble. Compré USDT por primera vez y fue re fácil. Abrazo grande desde Córdoba.', metadata: { mood: 'positive' }, created_at: '2025-03-10T14:31:00Z' },
    { id: 'm3', conversation_id: 'conv-001', sender: 'ceo', text: '¡Gracias por tu mensaje! Lo voy a leer personalmente. 💛', metadata: null, created_at: '2025-03-10T14:31:30Z' },
    { id: 'm4', conversation_id: 'conv-001', sender: 'user', text: 'Dale, seguí así! 🚀', metadata: null, created_at: '2025-03-10T14:32:00Z' },
  ],
  'conv-002': [
    { id: 'm5', conversation_id: 'conv-002', sender: 'ceo', text: '¡Hola! Soy Guille, CEO de El Dorado. Contame, ¿en qué puedo ayudarte?', metadata: null, created_at: '2025-03-11T09:15:00Z' },
    { id: 'm6', conversation_id: 'conv-002', sender: 'user', text: 'Hola Guille, estaría bueno poder hacer transferencias P2P más rápido. A veces tarda bastante en confirmar.', metadata: { mood: 'idea' }, created_at: '2025-03-11T09:17:00Z' },
  ],
  'conv-003': [
    { id: 'm7', conversation_id: 'conv-003', sender: 'ceo', text: '¡Hola! Soy Guille, CEO de El Dorado. Contame, ¿en qué puedo ayudarte?', metadata: null, created_at: '2025-03-11T18:00:00Z' },
    { id: 'm8', conversation_id: 'conv-003', sender: 'user', text: 'Che Guille, me encanta la tarjeta pero los límites son muy bajos para uso diario. ¿Se pueden subir?', metadata: { mood: 'talk' }, created_at: '2025-03-11T18:02:00Z' },
    { id: 'm9', conversation_id: 'conv-003', sender: 'ceo', text: '¡Gracias por tu mensaje! Lo voy a leer personalmente. 💛', metadata: null, created_at: '2025-03-11T18:02:30Z' },
  ],
  'conv-004': [
    { id: 'm10', conversation_id: 'conv-004', sender: 'ceo', text: '¡Hola! Soy Guille, CEO de El Dorado. Contame, ¿en qué puedo ayudarte?', metadata: null, created_at: '2025-03-12T08:00:00Z' },
    { id: 'm11', conversation_id: 'conv-004', sender: 'user', text: 'Guille, hace 3 días que estoy esperando que me verifiquen la cuenta y nadie me responde. Necesito acceder a mi plata YA.', metadata: { mood: 'frustrated' }, created_at: '2025-03-12T08:05:00Z' },
    { id: 'm12', conversation_id: 'conv-004', sender: 'ceo', text: '¡Gracias por tu mensaje! Lo voy a leer personalmente. 💛', metadata: null, created_at: '2025-03-12T08:05:30Z' },
    { id: 'm13', conversation_id: 'conv-004', sender: 'user', text: 'Espero que sea verdad porque ya mandé 4 mails y nada.', metadata: null, created_at: '2025-03-12T08:10:00Z' },
    { id: 'm14', conversation_id: 'conv-004', sender: 'user', text: 'Actualización: me respondieron recién. Gracias igual.', metadata: null, created_at: '2025-03-12T08:30:00Z' },
  ],
  'conv-005': [
    { id: 'm15', conversation_id: 'conv-005', sender: 'ceo', text: '¡Hola! Soy Guille, CEO de El Dorado. Contame, ¿en qué puedo ayudarte?', metadata: null, created_at: '2025-03-09T20:45:00Z' },
    { id: 'm16', conversation_id: 'conv-005', sender: 'user', text: 'Quería sugerirte que agreguen staking de USDT directo desde la app. Sería un golazo.', metadata: { mood: 'idea' }, created_at: '2025-03-09T20:47:00Z' },
  ],
};

const MOCK_NOTES: Record<string, CeoNote[]> = {
  'conv-001': [
    { id: 'n1', conversation_id: 'conv-001', text: 'Buen feedback. Compartir con marketing para testimonial.', created_at: '2025-03-10T16:00:00Z' },
  ],
  'conv-002': [],
  'conv-003': [
    { id: 'n2', conversation_id: 'conv-003', text: 'Revisar con producto los límites de la tarjeta.', created_at: '2025-03-11T19:00:00Z' },
  ],
  'conv-004': [
    { id: 'n3', conversation_id: 'conv-004', text: 'Escalar a soporte — verificación demorada 3 días.', created_at: '2025-03-12T09:00:00Z' },
    { id: 'n4', conversation_id: 'conv-004', text: 'Resuelto. Hablar con el equipo de compliance sobre tiempos.', created_at: '2025-03-12T10:00:00Z' },
  ],
  'conv-005': [],
};

// ── Exported functions ───────────────────────────────────────

export async function adminLogin(password: string): Promise<void> {
  try {
    const data = await authRequest<{ token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    setToken(data.token);
  } catch {
    // Backend unavailable — fallback to local password
    if (password === '123') {
      setToken('mock-token');
      sessionStorage.setItem(MOCK_MODE_KEY, '1');
      return;
    }
    throw new Error('Contraseña incorrecta');
  }
}

export async function getConversations(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminConversation[]> {
  if (isMock()) {
    let data = MOCK_CONVERSATIONS;
    if (filters?.status) data = data.filter((c) => c.status === filters.status);
    return data;
  }
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.offset) params.set('offset', String(filters.offset));
  const qs = params.toString();
  return authRequest(`/api/admin/conversations${qs ? `?${qs}` : ''}`);
}

export async function getMessages(conversationId: string): Promise<AdminMessage[]> {
  if (isMock()) return MOCK_MESSAGES[conversationId] ?? [];
  return authRequest(`/api/admin/conversations/${conversationId}/messages`);
}

export async function getNotes(conversationId: string): Promise<CeoNote[]> {
  if (isMock()) return MOCK_NOTES[conversationId] ?? [];
  return authRequest(`/api/admin/conversations/${conversationId}/notes`);
}

export async function sendReply(conversationId: string, text: string): Promise<AdminMessage> {
  if (isMock()) {
    const msg: AdminMessage = {
      id: `m-${Date.now()}`,
      conversation_id: conversationId,
      sender: 'ceo',
      text,
      metadata: { source: 'admin' },
      created_at: new Date().toISOString(),
    };
    const list = MOCK_MESSAGES[conversationId];
    if (list) list.push(msg);
    return msg;
  }
  return authRequest(`/api/admin/conversations/${conversationId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function addNote(conversationId: string, text: string): Promise<CeoNote> {
  if (isMock()) {
    const note: CeoNote = {
      id: `n-${Date.now()}`,
      conversation_id: conversationId,
      text,
      created_at: new Date().toISOString(),
    };
    const list = MOCK_NOTES[conversationId];
    if (list) list.push(note);
    return note;
  }
  return authRequest(`/api/admin/conversations/${conversationId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}
