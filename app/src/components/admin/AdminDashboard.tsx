import { useState, useEffect } from 'react';
import { getConversations, clearToken } from '../../api/admin-client';
import type { AdminConversation } from '../../types';

interface AdminDashboardProps {
  onSelect: (conversation: AdminConversation) => void;
  onLogout: () => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'closed', label: 'Cerrados' },
  { value: 'ticket_opened', label: 'Ticket' },
];

export function AdminDashboard({ onSelect, onLogout }: AdminDashboardProps) {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getConversations({ status: statusFilter || undefined })
      .then(setConversations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const handleLogout = () => {
    clearToken();
    onLogout();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: '#00FF88',
      closed: '#999999',
      ticket_opened: '#4488FF',
    };
    return (
      <span
        className="text-xs font-medium rounded-full"
        style={{
          backgroundColor: `${colors[status] || '#666'}22`,
          color: colors[status] || '#666',
          padding: '2px 10px',
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="mx-auto" style={{ maxWidth: 960, padding: '24px 20px' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <div className="flex items-center gap-3">
            <img src="/assets/logo.svg" alt="El Dorado" style={{ height: 24 }} />
            <h1 className="text-lg font-semibold text-text-primary">Conversaciones</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2" style={{ marginBottom: 16 }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className="text-sm rounded-lg transition-colors"
              style={{
                padding: '6px 14px',
                backgroundColor: statusFilter === opt.value ? '#FFFF00' : '#1A1A1A',
                color: statusFilter === opt.value ? '#0A0A0A' : '#999999',
                border: '1px solid',
                borderColor: statusFilter === opt.value ? '#FFFF00' : '#333333',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-accent-danger text-sm" style={{ marginBottom: 12 }}>{error}</p>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-text-secondary text-sm">Cargando...</p>
        )}

        {/* Empty */}
        {!loading && !error && conversations.length === 0 && (
          <p className="text-text-muted text-sm">No hay conversaciones.</p>
        )}

        {/* List */}
        <div className="flex flex-col gap-2">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="w-full text-left rounded-xl transition-colors hover:brightness-110"
              style={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #333333',
                padding: '14px 18px',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <span className="text-sm font-medium text-text-primary">{c.external_id}</span>
                <div className="flex items-center gap-2">
                  {c.rating !== null && (
                    <span className="text-xs text-text-secondary">
                      {'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}
                    </span>
                  )}
                  {statusBadge(c.status)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  {c.message_count} mensaje{c.message_count !== '1' ? 's' : ''}
                  {c.email && ` · ${c.email}`}
                </span>
                <span className="text-xs text-text-muted">{formatDate(c.created_at)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
