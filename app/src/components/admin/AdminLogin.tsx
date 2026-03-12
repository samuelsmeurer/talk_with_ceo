import { useState } from 'react';
import { adminLogin } from '../../api/admin-client';

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(password);
      onSuccess();
    } catch {
      setError('Contraseña incorrecta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-5"
        style={{ padding: '0 24px' }}
      >
        <div className="flex flex-col items-center gap-3">
          <img src="/assets/logo.svg" alt="El Dorado" style={{ height: 32 }} />
          <h1 className="text-xl font-semibold text-text-primary">Admin Dashboard</h1>
        </div>

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full rounded-xl text-text-primary placeholder-text-muted outline-none"
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #333333',
            padding: '12px 16px',
            fontSize: 14,
          }}
        />

        {error && (
          <p className="text-accent-danger text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl font-semibold transition-opacity disabled:opacity-40"
          style={{
            backgroundColor: '#FFFF00',
            color: '#0A0A0A',
            padding: '12px 16px',
            fontSize: 14,
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
