import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import { getSubscriptionStatus } from './lib/subscription';
import type { SubscriptionStatus } from './lib/subscription';
import Sidebar from './components/Sidebar';
import RechnerView from './components/views/RechnerView';
import FuhrparkView from './components/views/FuhrparkView';
import HistorieView from './components/views/HistorieView';
import AuthView from './components/views/AuthView';
import PaywallView from './components/views/PaywallView';
import EinstellungenView from './components/views/EinstellungenView';

export default function App() {
  const [view, setView] = useState('rechner');
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getSubscriptionStatus().then(setSubscription);
        supabase.from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url); });
      }
      setLoading(false);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getSubscriptionStatus().then(setSubscription);
      } else {
        setSubscription(null);
        setAvatarUrl('');
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      Laden...
    </div>
  );

  if (!user) return <AuthView />;

  if (user && subscription && !subscription.isActive) {
    return <PaywallView />;
  }

  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      <Sidebar
        view={view}
        setView={setView}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        trialDaysLeft={subscription?.trialDaysLeft}
        avatarUrl={avatarUrl}
      />
      <main style={{
        marginLeft: sidebarWidth,
        padding: '40px 48px',
        minHeight: '100vh',
        transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {view === 'rechner'       && <RechnerView />}
        {view === 'fuhrpark'      && <FuhrparkView />}
        {view === 'historie'      && <HistorieView />}
        {view === 'einstellungen' && (
          <EinstellungenView
            subscriptionStatus={subscription?.status}
            trialDaysLeft={subscription?.trialDaysLeft}
            onAvatarChange={setAvatarUrl}
          />
        )}
      </main>
    </div>
  );
}
