import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  view: string;
  setView: (v: string) => void;
  collapsed: boolean;
  setCollapsed: (fn: (c: boolean) => boolean) => void;
  trialDaysLeft?: number;
}

const NAV_ITEMS = [
  { id: 'rechner',  icon: '⚡', label: 'Logistikrechner' },
  { id: 'fuhrpark', icon: '🚛', label: 'Mein Fuhrpark' },
  { id: 'historie', icon: '📋', label: 'Berechnungen' },
];

export default function Sidebar({ view, setView, collapsed, setCollapsed, trialDaysLeft }: SidebarProps) {
  const w = collapsed ? 64 : 220;
  const [firmenname, setFirmenname] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? '');
      supabase.from('profiles')
        .select('firmenname, name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.firmenname) setFirmenname(data.firmenname);
          if (data?.name) setName(data.name);
        });
    });
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: w,
      minWidth: w,
      background: '#FFFFFF',
      borderRight: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
      zIndex: 100,
    }}>

      {/* Header */}
      <div style={{
        height: 64,
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0 16px' : '0 12px',
        justifyContent: collapsed ? 'center' : 'space-between',
        flexShrink: 0,
        position: 'relative',
      }}>
        {collapsed ? (
          <>
            <button
              onClick={() => setCollapsed(c => !c)}
              title="Sidebar ausklappen"
              style={{
                position: 'absolute',
                right: 6,
                bottom: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                color: '#9CA3AF',
                padding: '2px 4px',
                lineHeight: 1,
              }}
            >→</button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#111111', whiteSpace: 'nowrap' }}>
                  Logistikrechner
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                  by ProdSync
                </div>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(c => !c)}
              title="Sidebar einklappen"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: '#9CA3AF',
                padding: '4px 6px',
                flexShrink: 0,
              }}
            >←</button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: collapsed ? '10px 0' : '10px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? '#FFF7ED' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: active ? '#EA580C' : '#6B7280',
                fontWeight: active ? 700 : 400,
                fontSize: 14,
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #E5E7EB',
        padding: collapsed ? '12px 0' : '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#FFF7ED',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}>
          👷
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111111', whiteSpace: 'nowrap' }}>
              {name || email}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', whiteSpace: 'nowrap' }}>
              {firmenname}
            </div>
            <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2, whiteSpace: 'nowrap' }}>
              developed by <span style={{ color: '#F97316' }}>ProdSync</span>
            </div>
            {trialDaysLeft !== undefined && trialDaysLeft > 0 && (
              <div style={{
                background: '#FFF7ED', border: '1px solid #F97316',
                borderRadius: 8, padding: '6px 10px', marginBottom: 8,
                fontSize: 11, color: '#EA580C', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", textAlign: 'center',
              }}>
                🕐 Noch {trialDaysLeft} Tag{trialDaysLeft !== 1 ? 'e' : ''} gratis
              </div>
            )}
            <button
              onClick={() => supabase.auth.signOut()}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '7px 0',
                borderRadius: 8,
                border: '1.5px solid #E5E7EB',
                background: 'white',
                color: '#6B7280',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              Abmelden
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
