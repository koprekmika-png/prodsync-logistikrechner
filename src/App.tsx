import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import Sidebar from './components/Sidebar';
import RechnerView from './components/views/RechnerView';
import FuhrparkView from './components/views/FuhrparkView';
import HistorieView from './components/views/HistorieView';
import AuthView from './components/views/AuthView';

export default function App() {
  const [view, setView] = useState('rechner');
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      Laden...
    </div>
  );

  if (!user) return <AuthView />;

  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      <Sidebar
        view={view}
        setView={setView}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main style={{
        marginLeft: sidebarWidth,
        padding: '40px 48px',
        minHeight: '100vh',
        transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {view === 'rechner'  && <RechnerView />}
        {view === 'fuhrpark' && <FuhrparkView />}
        {view === 'historie' && <HistorieView />}
      </main>
    </div>
  );
}
