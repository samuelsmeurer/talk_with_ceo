import { useState, useEffect, useMemo, useCallback } from 'react';
import { getConversations, toggleFavorite, clearToken } from '../../api/admin-client';
import type { AdminConversation, AnalysisCategory, ResponseStatus, SortField, SortDirection } from '../../types';

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

const CATEGORY_OPTIONS: { value: AnalysisCategory | ''; label: string; color: string }[] = [
  { value: '', label: 'Todas', color: '#999999' },
  { value: 'elogio', label: 'Elogio', color: '#00FF88' },
  { value: 'sugerencia', label: 'Sugerencia', color: '#4488FF' },
  { value: 'reclamo', label: 'Reclamo', color: '#FF4444' },
  { value: 'duda', label: 'Duda', color: '#FF9944' },
  { value: 'bug', label: 'Bug', color: '#FF44FF' },
  { value: 'otro', label: 'Otro', color: '#999999' },
];

const IMPORTANCE_OPTIONS = [
  { value: 0, label: 'Todas' },
  { value: 4, label: '4+' },
  { value: 5, label: '5' },
];

const RESPONSE_STATUS_OPTIONS: { value: ResponseStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'respondida', label: 'Respondida' },
  { value: 'con_comentario', label: 'Con comentario' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'sin_comentario', label: 'Sin comentario' },
];

const CATEGORY_COLORS: Record<string, string> = {
  elogio: '#00FF88',
  sugerencia: '#4488FF',
  reclamo: '#FF4444',
  duda: '#FF9944',
  bug: '#FF44FF',
  otro: '#999999',
};

const SENTIMENT_ICONS: Record<string, string> = {
  positivo: '+',
  neutro: '~',
  negativo: '-',
};

const SENTIMENT_COLORS: Record<string, string> = {
  positivo: '#00FF88',
  neutro: '#999999',
  negativo: '#FF4444',
};

const RESPONSE_STATUS_COLORS: Record<string, string> = {
  respondida: '#00FF88',
  con_comentario: '#4488FF',
  pendiente: '#FF9944',
  sin_comentario: '#666666',
};

const RESPONSE_STATUS_LABELS: Record<string, string> = {
  respondida: 'Respondida',
  con_comentario: 'Con comentario',
  pendiente: 'Pendiente',
  sin_comentario: 'Sin comentario',
};

const SORT_COMPARATORS: Record<SortField, (a: AdminConversation, b: AdminConversation) => number> = {
  is_favorited: (a, b) => Number(a.is_favorited) - Number(b.is_favorited),
  external_id: (a, b) => a.external_id.localeCompare(b.external_id),
  ai_category: (a, b) => (a.ai_category ?? '').localeCompare(b.ai_category ?? ''),
  ai_importance: (a, b) => (a.ai_importance ?? 0) - (b.ai_importance ?? 0),
  ai_sentiment: (a, b) => (a.ai_sentiment ?? '').localeCompare(b.ai_sentiment ?? ''),
  response_status: (a, b) => a.response_status.localeCompare(b.response_status),
  created_at: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
};

export function AdminDashboard({ onSelect, onLogout }: AdminDashboardProps) {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [importanceMin, setImportanceMin] = useState(0);
  const [responseStatusFilter, setResponseStatusFilter] = useState('');
  const [favoritedOnly, setFavoritedOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getConversations({
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      importance_min: importanceMin || undefined,
      favorited: favoritedOnly || undefined,
      response_status: (responseStatusFilter as ResponseStatus) || undefined,
    })
      .then(setConversations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter, categoryFilter, importanceMin, favoritedOnly, responseStatusFilter]);

  const handleLogout = () => {
    clearToken();
    onLogout();
  };

  const handleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'created_at' ? 'desc' : 'asc');
    }
  }, [sortField]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent, conv: AdminConversation) => {
    e.stopPropagation();
    const prevValue = conv.is_favorited;
    // Optimistic update
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, is_favorited: !c.is_favorited } : c)),
    );
    try {
      await toggleFavorite(conv.id);
    } catch {
      // Revert on failure
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, is_favorited: prevValue } : c)),
      );
    }
  }, []);

  const sortedConversations = useMemo(() => {
    const comparator = SORT_COMPARATORS[sortField];
    const sorted = [...conversations].sort((a, b) => {
      const result = comparator(a, b);
      return sortDirection === 'asc' ? result : -result;
    });
    return sorted;
  }, [conversations, sortField, sortDirection]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return <span style={{ color: '#FFFF00', marginLeft: 4 }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>;
  };

  const renderFilterButton = (
    value: string,
    current: string,
    label: string,
    onClick: () => void,
    activeColor = '#FFFF00',
    activeBg = '#FFFF00',
  ) => (
    <button
      key={value}
      onClick={onClick}
      className="text-xs rounded-full transition-colors"
      style={{
        padding: '3px 10px',
        backgroundColor: current === value ? `${activeBg}33` : 'transparent',
        color: current === value ? activeColor : '#666666',
        border: '1px solid',
        borderColor: current === value ? `${activeColor}66` : '#33333366',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="mx-auto" style={{ maxWidth: 1200, padding: '24px 20px' }}>
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

        {/* Status Filters */}
        <div className="flex gap-2" style={{ marginBottom: 10 }}>
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

        {/* AI + Estado + Favoritos Filters */}
        <div className="flex flex-wrap items-center gap-4" style={{ marginBottom: 16 }}>
          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Categoría:</span>
            <div className="flex gap-1">
              {CATEGORY_OPTIONS.map((opt) =>
                renderFilterButton(
                  opt.value,
                  categoryFilter,
                  opt.label,
                  () => setCategoryFilter(opt.value),
                  opt.color,
                  opt.color,
                ),
              )}
            </div>
          </div>

          {/* Importance */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Importancia:</span>
            <div className="flex gap-1">
              {IMPORTANCE_OPTIONS.map((opt) =>
                renderFilterButton(
                  String(opt.value),
                  String(importanceMin),
                  opt.label,
                  () => setImportanceMin(opt.value),
                  '#FF4444',
                  '#FF4444',
                ),
              )}
            </div>
          </div>

          {/* Response Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Estado:</span>
            <div className="flex gap-1">
              {RESPONSE_STATUS_OPTIONS.map((opt) => {
                const color = opt.value ? RESPONSE_STATUS_COLORS[opt.value] : '#999999';
                return renderFilterButton(
                  opt.value,
                  responseStatusFilter,
                  opt.label,
                  () => setResponseStatusFilter(opt.value),
                  color,
                  color,
                );
              })}
            </div>
          </div>

          {/* Favorited toggle */}
          <button
            onClick={() => setFavoritedOnly((v) => !v)}
            className="flex items-center gap-1 text-xs rounded-full transition-colors"
            style={{
              padding: '3px 10px',
              backgroundColor: favoritedOnly ? '#FFFF0033' : 'transparent',
              color: favoritedOnly ? '#FFFF00' : '#666666',
              border: '1px solid',
              borderColor: favoritedOnly ? '#FFFF0066' : '#33333366',
            }}
          >
            <span style={{ fontSize: 12 }}>★</span> Solo favoritos
          </button>
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

        {/* Table */}
        {!loading && sortedConversations.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333333' }}>
                  <th
                    onClick={() => handleSort('is_favorited')}
                    style={{ width: 40, padding: '10px 6px', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <span className="text-xs text-text-muted">★</span>
                    {renderSortIndicator('is_favorited')}
                  </th>
                  <th
                    onClick={() => handleSort('external_id')}
                    style={{ padding: '10px 8px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span className="text-xs text-text-muted font-medium">Usuario</span>
                    {renderSortIndicator('external_id')}
                  </th>
                  <th
                    onClick={() => handleSort('ai_category')}
                    style={{ width: 100, padding: '10px 8px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span className="text-xs text-text-muted font-medium">Tema</span>
                    {renderSortIndicator('ai_category')}
                  </th>
                  <th
                    onClick={() => handleSort('ai_importance')}
                    style={{ width: 80, padding: '10px 8px', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <span className="text-xs text-text-muted font-medium">Imp.</span>
                    {renderSortIndicator('ai_importance')}
                  </th>
                  <th
                    onClick={() => handleSort('ai_sentiment')}
                    style={{ width: 100, padding: '10px 8px', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <span className="text-xs text-text-muted font-medium">Sentimiento</span>
                    {renderSortIndicator('ai_sentiment')}
                  </th>
                  <th
                    onClick={() => handleSort('response_status')}
                    style={{ width: 130, padding: '10px 8px', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <span className="text-xs text-text-muted font-medium">Estado</span>
                    {renderSortIndicator('response_status')}
                  </th>
                  <th
                    onClick={() => handleSort('created_at')}
                    style={{ width: 130, padding: '10px 8px', cursor: 'pointer', textAlign: 'right' }}
                  >
                    <span className="text-xs text-text-muted font-medium">Fecha</span>
                    {renderSortIndicator('created_at')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedConversations.map((c) => {
                  const catColor = c.ai_category ? CATEGORY_COLORS[c.ai_category] || '#999' : '#999';
                  const sentColor = c.ai_sentiment ? SENTIMENT_COLORS[c.ai_sentiment] || '#999' : '#999';
                  const sentIcon = c.ai_sentiment ? SENTIMENT_ICONS[c.ai_sentiment] || '~' : '';
                  const respColor = RESPONSE_STATUS_COLORS[c.response_status] || '#666';
                  const respLabel = RESPONSE_STATUS_LABELS[c.response_status] || c.response_status;
                  const isHighPriority = (c.ai_importance ?? 0) >= 4;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelect(c)}
                      className="transition-colors"
                      style={{
                        borderBottom: '1px solid #1f1f1f',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Favorite */}
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                        <button
                          onClick={(e) => handleToggleFavorite(e, c)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 16,
                            color: c.is_favorited ? '#FFFF00' : '#444444',
                            lineHeight: 1,
                          }}
                          title={c.is_favorited ? 'Quitar favorito' : 'Marcar favorito'}
                        >
                          ★
                        </button>
                      </td>

                      {/* User */}
                      <td style={{ padding: '10px 8px' }}>
                        <div className="flex items-center gap-2" style={{ lineHeight: 1.3 }}>
                          <span className="text-sm font-medium text-text-primary">
                            {c.external_id}
                          </span>
                          {c.status === 'ticket_opened' && (
                            <span
                              className="text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: '#FF994422',
                                color: '#FF9944',
                                padding: '1px 7px',
                              }}
                            >
                              Ticket
                            </span>
                          )}
                        </div>
                        {c.email && (
                          <div className="text-xs text-text-muted" style={{ lineHeight: 1.3 }}>
                            {c.email}
                          </div>
                        )}
                      </td>

                      {/* Category (Tema) */}
                      <td style={{ padding: '10px 8px' }}>
                        {c.ai_category ? (
                          <span
                            className="text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: `${catColor}22`,
                              color: catColor,
                              padding: '2px 8px',
                              display: 'inline-block',
                            }}
                            title={c.ai_summary || undefined}
                          >
                            {c.ai_category}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>

                      {/* Importance */}
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {c.ai_importance !== null && c.ai_importance !== undefined ? (
                          <span
                            className="text-xs font-bold rounded-full"
                            style={{
                              backgroundColor: isHighPriority ? '#FF444433' : '#33333366',
                              color: isHighPriority ? '#FF4444' : '#999999',
                              padding: '2px 7px',
                              minWidth: 22,
                              textAlign: 'center',
                              display: 'inline-block',
                            }}
                          >
                            {c.ai_importance}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>

                      {/* Sentiment */}
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {c.ai_sentiment ? (
                          <span
                            className="text-xs font-bold"
                            style={{ color: sentColor }}
                          >
                            {sentIcon} {c.ai_sentiment}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>

                      {/* Response Status */}
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span
                          className="text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: `${respColor}22`,
                            color: respColor,
                            padding: '2px 10px',
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {respLabel}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                        <span className="text-xs text-text-muted">{formatDate(c.created_at)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
