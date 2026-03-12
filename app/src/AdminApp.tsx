import { useState, useCallback } from 'react';
import { isAuthenticated } from './api/admin-client';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ConversationDetail } from './components/admin/ConversationDetail';
import type { AdminConversation } from './types';

type AdminView = 'login' | 'list' | 'detail';

export default function AdminApp() {
  const [view, setView] = useState<AdminView>(isAuthenticated() ? 'list' : 'login');
  const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);

  const handleLoginSuccess = useCallback(() => {
    setView('list');
  }, []);

  const handleSelectConversation = useCallback((conversation: AdminConversation) => {
    setSelectedConversation(conversation);
    setView('detail');
  }, []);

  const handleBack = useCallback(() => {
    setSelectedConversation(null);
    setView('list');
  }, []);

  const handleLogout = useCallback(() => {
    setView('login');
  }, []);

  switch (view) {
    case 'login':
      return <AdminLogin onSuccess={handleLoginSuccess} />;
    case 'list':
      return <AdminDashboard onSelect={handleSelectConversation} onLogout={handleLogout} />;
    case 'detail':
      return selectedConversation ? (
        <ConversationDetail conversation={selectedConversation} onBack={handleBack} />
      ) : null;
  }
}
